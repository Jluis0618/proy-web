// src/models/index.js

import { sequelize as _sequelize } from "../config/database.js";
import ItemModel from "./Item.js";

const Item = ItemModel(_sequelize);

export const sequelize = _sequelize;
export { Item };
