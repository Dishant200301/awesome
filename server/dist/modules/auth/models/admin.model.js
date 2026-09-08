import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/index.js";
export class Admin extends Model {
    id;
    name;
    email;
    password_hash;
    role;
    is_active;
    created_at;
}
Admin.init({
    id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING(50),
        defaultValue: "Super Admin",
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize,
    tableName: "admins",
    timestamps: false,
});
