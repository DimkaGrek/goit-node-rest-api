import HttpError from '../helpers/HttpError.js';
import contactsService from '../services/contactsServices.js';

export const getAllContacts = async (req, res, next) => {
    try {
        const listContacts = await contactsService.listContacts();

        return res.status(200).json(listContacts);
    } catch (error) {
        next(error);
    }
};

export const getOneContact = async (req, res, next) => {
    try {
        const id = req.params.id;
        const contact = await contactsService.getContactById(id);

        return res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
};

export const deleteContact = async (req, res, next) => {
    try {
        const id = req.params.id;
        const contact = await contactsService.removeContact(id);

        return res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
};

export const createContact = async (req, res, next) => {
    try {
        const contact = await contactsService.addContact(req.body);

        return res.status(201).json(contact);
    } catch (error) {
        next(error);
    }
};

export const updateContact = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { name, email, phone } = req.body;
        if (!(name || email || phone)) {
            throw HttpError(400, 'Body must have at least one field');
        }
        const contact = await contactsService.updateContact(id, req.body);

        return res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
};

export const updateStatusContact = async (req, res, next) => {
    try {
        const id = req.params.id;
        const contact = await contactsService.updateContact(id, req.body);

        return res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
};
