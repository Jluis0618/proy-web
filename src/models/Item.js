import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Item = sequelize.define(
    "Item",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      code: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true }
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: { notEmpty: true }
      },
      description: { type: DataTypes.TEXT, allowNull: true },
      qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0, isInt: true }
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0, isFloat: true }
      },
      photo: { type: DataTypes.STRING, allowNull: true }
    },
    {
      tableName: "items",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  );

  return Item;
};
