const categoryService = require('../services/CategoryService');

async function getCategories(req, res) {
    try {
        const categories = await categoryService.getCategory();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function addCategory(req, res) {
    const category = req.body;
    try {
        const categoryId = await categoryService.addCategory(category);
        res.status(201).json({ id: categoryId });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updateCategory(req, res) {
    const category = req.body;
    try {
        const affectedRows = await categoryService.updateCategory(category);
        if (affectedRows > 0) {
            res.status(200).json({ message: 'Category updated successfully' });
        }
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deleteCategory(req, res) {
    const categoryId = req.params.id;
    try {
        const affectedRows = await categoryService.deleteCategory({ id: categoryId });
        if (affectedRows > 0) {
            res.status(200).json({ message: 'Category deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getCategories,
    addCategory,    
    updateCategory,
    deleteCategory
};