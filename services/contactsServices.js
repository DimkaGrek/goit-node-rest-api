import { Contact } from '../models/Contact.js';
import HttpError from '../helpers/HttpError.js';

const listContacts = async (query) => {
    const favorite = query.favorite;
    let param = {};
    if (favorite === 'true') {
        param = { favorite: true };
    } else if (favorite === 'false') {
        param = { favorite: false };
    }
    const data = await Contact.find(param);
    if (!data) {
        throw HttpError(404);
    }

    return data;
};

const getContactById = async (contactId) => {
    const data = await Contact.findById(contactId);

    if (!data) {
        throw HttpError(404);
    }
    return data;
};

const removeContact = async (contactId) => {
    const data = await Contact.findByIdAndDelete(contactId);
    if (!data) {
        throw HttpError(404);
    }
    return data;
};

const addContact = async (data) => {
    const newContact = await Contact.create(data);
    return newContact;
};

const updateContact = async (id, data) => {
    const contact = await Contact.findByIdAndUpdate(id, data, { new: true });

    if (!contact) {
        throw HttpError(404);
    }

    return contact;
};

export default {
    listContacts,
    getContactById,
    removeContact,
    addContact,
    updateContact,
};
