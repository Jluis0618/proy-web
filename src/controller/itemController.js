import { Op } from "sequelize";
import { Item } from "../models/index.js";

// GET /api/items (con buscador opcional)
export const getAllItems = async (req, res) => {
  try {
    const { q } = req.query;

    let whereClause = {};
    if (q) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
        ],
      };
    }

    const items = await Item.findAll({ where: whereClause });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los artículos" });
  }
};

// GET /api/items/:id
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el artículo" });
  }
};

// POST /api/items
export const createItem = async (req, res) => {
  try {
    const { code, name, description, qty, price } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const newItem = await Item.create({
      code,
      name,
      description,
      qty,
      price,
      photo,
    });

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Error al crear el artículo" });
  }
};

// PUT /api/items/:id
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, qty, price } = req.body;

    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    const photo = req.file ? `/uploads/${req.file.filename}` : item.photo;

    await item.update({ code, name, description, qty, price, photo });

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el artículo" });
  }
};

// DELETE /api/items/:id
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }

    await item.destroy();
    res.json({ message: "Artículo eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el artículo" });
  }
};
