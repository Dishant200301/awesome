import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/modules/product/context/CartContext";
import { useAuth } from "@/modules/core/context/AuthContext";
import {
  CheckoutContact,
  ShippingAddress,
  ShippingMethod,
  PaymentMethodType,
  UPIPaymentDetails,
  CardPaymentDetails,
  Coupon,
  OrderPayload
} from "../types/checkout";
import { CheckoutHeader } from "../components/CheckoutHeader";
import { ContactInformation } from "../components/ContactInformation";
import { AddressForm } from "../components/AddressForm";
import { SHIPPING_METHODS, ShippingMethodSelector } from "../components/ShippingMethodSelector";
import { OrderSummary } from "../components/OrderSummary";
import { PaymentMethodSelector } from "../components/PaymentMethodSelector";
import { CheckoutTerms } from "../components/CheckoutTerms";
import { PlaceOrderButton } from "../components/PlaceOrderButton";
import Footer from "@/modules/core/components/Footer";
import { AlertCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import { deductLiveStock } from "@/modules/core/lib/apiStore";

const SAVED_ADDRESSES_KEY = "awesome_saved_addresses_v1";

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();

  // Contact Info State
  const [contact, setContact] = useState<CheckoutContact>({
    email: user?.email || "",
    phone: ""
  });

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_ADDRESSES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "addr-1",
        firstName: "Rahul",
        lastName: "Sharma",
        addressLine1: "Flat 402, Sunshine Heights, Linking Road",
        addressLine2: "Near Bandra Station",
        country: "India",
        state: "Maharashtra",
        city: "Mumbai",
        pincode: "400050",
        phone: "9876543210",
        saveAddress: true
      }
    ];
  });

  // Shipping Address State
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(() => {
    return savedAddresses[0] || {
      firstName: "",
      lastName: "",
      addressLine1: "",
      addressLine2: "",
      country: "India",
      state: "Maharashtra",
      city: "Mumbai",
      pincode: "",
      phone: "",
      saveAddress: true
    };
  });

  // Shipping Method State
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod>(SHIPPING_METHODS[0]);

  // Payment Method State
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>("upi");
  const [upiDetails, setUpiDetails] = useState<UPIPaymentDetails>({ vpa: "" });
  const [cardDetails, setCardDetails] = useState<CardPaymentDetails>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });

  // Coupon & Terms State
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Submission & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // If user opens /checkout with an empty cart, redirect or show clean empty state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col justify-between selection:bg-black selection:text-white">
        <CheckoutHeader activeStep={1} />

        <div className="py-20 sm:py-28 text-center max-w-md mx-auto px-4 space-y-6">
          <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto border border-zinc-200">
            <ShoppingBag className="w-10 h-10" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 uppercase tracking-tight">
            Your Checkout Cart is Empty
          </h2>
          <p className="text-xs text-zinc-500 font-normal">
            You don't have any items in your shopping cart to checkout.
          </p>

          <div>
            <Link to="/shop">
              <button
                type="button"
                className="px-8 py-3.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all shadow-md cursor-pointer"
              >
                Return to Shop
              </button>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Calculate totals
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      couponDiscountAmount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && couponDiscountAmount > appliedCoupon.maxDiscount) {
        couponDiscountAmount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.discountType === "fixed") {
      couponDiscountAmount = appliedCoupon.discountValue;
    }
  }

  const shippingPrice = appliedCoupon?.freeShipping ? 0 : selectedShippingMethod.price;
  const estimatedTax = Math.round(subtotal * 0.05);
  const grandTotal = Math.max(0, subtotal - couponDiscountAmount + shippingPrice);

  // Validate entire checkout form
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    // 1. Contact Validation
    if (!contact.email.trim()) {
      errs.email = "Please enter a valid email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      errs.email = "Please enter a valid email address format.";
    }

    if (!contact.phone.trim()) {
      errs.phone = "Please enter a 10-digit mobile number.";
    } else if (!/^[6-9]\d{9}$/.test(contact.phone.trim())) {
      errs.phone = "Please enter a valid 10-digit Indian mobile number.";
    }

    // 2. Address Validation
    if (!shippingAddress.firstName.trim()) errs.firstName = "First name is required.";
    if (!shippingAddress.lastName.trim()) errs.lastName = "Last name is required.";
    if (!shippingAddress.addressLine1.trim()) errs.addressLine1 = "Address line 1 is required.";
    if (!shippingAddress.city.trim()) errs.city = "City is required.";
    if (!shippingAddress.state.trim()) errs.state = "State is required.";

    if (!shippingAddress.pincode.trim()) {
      errs.pincode = "6-digit PIN code is required.";
    } else if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      errs.pincode = "Please enter a valid 6-digit Indian PIN code.";
    }

    // 3. Payment Method Specific Validation
    if (selectedPayment === "upi") {
      if (!upiDetails.vpa.trim()) {
        errs.upiVpa = "Please enter your UPI ID / VPA (e.g. mobile@upi).";
      } else if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiDetails.vpa.trim())) {
        errs.upiVpa = "Please enter a valid UPI ID format (e.g. username@bank).";
      }
    } else if (selectedPayment === "card") {
      const cleanNum = cardDetails.cardNumber.replace(/\s+/g, "");
      if (!cleanNum || cleanNum.length < 15) errs.cardNumber = "Valid 16-digit card number required.";
      if (!cardDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) errs.expiryDate = "Valid MM/YY required.";
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) errs.cvv = "Valid CVV required.";
      if (!cardDetails.cardholderName.trim()) errs.cardholderName = "Cardholder name required.";
    }

    // 4. Terms Validation
    if (!termsAccepted) {
      errs.terms = "Please accept the Terms & Conditions and Privacy Policy.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Order Placement
  const handlePlaceOrder = () => {
    setGeneralError(null);

    if (!validateForm()) {
      setGeneralError("Please fix the highlighted errors before placing order.");
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    setTimeout(async () => {
      try {
        const orderId = `AWH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

        const orderObj: OrderPayload = {
          orderId,
          customer: contact,
          shippingAddress: {
            ...shippingAddress,
            phone: shippingAddress.phone || contact.phone
          },
          shippingMethod: selectedShippingMethod,
          paymentMethod: selectedPayment,
          paymentDetails: {
            upiVpa: selectedPayment === "upi" ? upiDetails.vpa : undefined,
            cardLast4: selectedPayment === "card" ? cardDetails.cardNumber.slice(-4) : undefined
          },
          coupon: appliedCoupon
            ? { code: appliedCoupon.code, discountAmount: couponDiscountAmount }
            : undefined,
          items: cartItems.map((item) => ({
            ...item,
            itemTotal: item.price * item.quantity,
            attributesSummary: `${item.colorName || ""} ${item.size || ""}`.trim()
          })),
          subtotal,
          discount: Math.max(0, cartItems.reduce((acc, i) => acc + ((i.originalPrice || i.price) - i.price) * i.quantity, 0)),
          couponDiscount: couponDiscountAmount,
          shipping: shippingPrice,
          tax: estimatedTax,
          grandTotal,
          status: "Confirmed",
          paymentStatus: selectedPayment === "cod" ? "Pending" : "Paid",
          createdAt: new Date().toISOString(),
          estimatedDeliveryDate: selectedShippingMethod.id === "express" ? "2–3 Business Days" : "5–7 Business Days"
        };

        // Save order to LocalStorage history
        try {
          localStorage.removeItem("aaramly_orders_v1");
          const existingSaved = localStorage.getItem("awesome_orders_v1");
          const ordersList: OrderPayload[] = existingSaved ? JSON.parse(existingSaved) : [];
          ordersList.unshift(orderObj);
          localStorage.setItem("awesome_orders_v1", JSON.stringify(ordersList));
        } catch {}

        // Save Address if checked
        if (shippingAddress.saveAddress) {
          try {
            const nextSaved = [shippingAddress, ...savedAddresses.filter((s) => s.addressLine1 !== shippingAddress.addressLine1)];
            localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(nextSaved.slice(0, 5)));
          } catch {}
        }

        // Deduct purchased quantity from live stock in real time
        await deductLiveStock(cartItems);

        // Clear cart & navigate to Order Success page
        clearCart();
        setIsSubmitting(false);
        navigate(`/order-success/${orderId}`, { state: { order: orderObj } });

      } catch (err) {
        setIsSubmitting(false);
        setGeneralError("An error occurred while creating order. Please try again.");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-zinc-50/60 text-zinc-900 font-sans flex flex-col justify-between selection:bg-black selection:text-white">
      <CheckoutHeader activeStep={2} />

      {/* GENERAL ERROR BANNER */}
      {generalError && (
        <div className="bg-red-50 border-b border-red-200 text-red-800 px-4 py-3 text-xs font-bold text-center animate-in fade-in flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* MAIN CHECKOUT CONTAINER */}
      <main className="py-8 sm:py-12 flex-1">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          {/* BACK TO CART LINK */}
          <div className="mb-6">
            <Link to="/cart" className="text-xs font-bold text-zinc-600 hover:text-black flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Shopping Cart</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN: CHECKOUT FORM (7 COLS ON DESKTOP) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. CONTACT INFORMATION */}
              <ContactInformation
                contact={contact}
                onChangeContact={setContact}
                errors={errors}
              />

              {/* 2. DELIVERY ADDRESS */}
              <AddressForm
                address={shippingAddress}
                onChangeAddress={setShippingAddress}
                savedAddresses={savedAddresses}
                onSelectSavedAddress={(sa) => setShippingAddress(sa)}
                errors={errors}
              />

              {/* 3. SHIPPING METHOD */}
              <ShippingMethodSelector
                selectedMethod={selectedShippingMethod}
                onSelectMethod={setSelectedShippingMethod}
              />

              {/* 4. PAYMENT METHOD */}
              <PaymentMethodSelector
                selectedPayment={selectedPayment}
                onSelectPayment={setSelectedPayment}
                upiDetails={upiDetails}
                onChangeUPIDetails={setUpiDetails}
                cardDetails={cardDetails}
                onChangeCardDetails={setCardDetails}
                errors={errors}
              />

              {/* 5. TERMS ACCEPTANCE */}
              <div className="p-4 bg-white rounded-xl border border-zinc-200">
                <CheckoutTerms
                  accepted={termsAccepted}
                  onToggleAccepted={setTermsAccepted}
                  error={errors.terms}
                />
              </div>

              {/* MOBILE PLACE ORDER BUTTON */}
              <div className="block lg:hidden pt-2">
                <PlaceOrderButton
                  grandTotal={grandTotal}
                  isSubmitting={isSubmitting}
                  onClick={handlePlaceOrder}
                />
              </div>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY (5 COLS ON DESKTOP) */}
            <div className="lg:col-span-5 sticky top-24">
              <OrderSummary
                cartItems={cartItems}
                shippingMethod={selectedShippingMethod}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={setAppliedCoupon}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                isSubmitting={isSubmitting}
                onPlaceOrder={handlePlaceOrder}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
