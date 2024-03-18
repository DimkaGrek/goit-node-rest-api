import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import HttpError from '../helpers/HttpError.js';

const contactsPath = path.resolve('db', 'contacts.json');

const updateContacts = async (contacts) =>
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

const listContacts = async () => {
    const data = await fs.readFile(contactsPath);
    if (!data) {
        throw HttpError(404);
    }
    return JSON.parse(data);
};

const getContactById = async (contactId) => {
    const contacts = await listContacts();
    const data = contacts.find((item) => item.id === contactId);

    if (!data) {
        throw HttpError(404);
    }
    return data;
};

const removeContact = async (contactId) => {
    const contacts = await listContacts();
    const index = contacts.findIndex((item) => item.id === contactId);
    if (index === -1) {
        throw HttpError(404);
    }
    const [result] = contacts.splice(index, 1);
    await updateContacts(contacts);
    return result;
};

const addContact = async ({ name, email, phone }) => {
    const contacts = await listContacts();
    const newContact = {
        id: nanoid(),
        name,
        email,
        phone,
    };
    contacts.push(newContact);
    await updateContacts(contacts);
    return newContact;
};

const updateContact = async (id, name, email, phone) => {
    const contacts = await listContacts();
    let contact = null;
    const updatedContacts = contacts.map((item) => {
        if (item.id === id) {
            if (name) item.name = name;
            if (email) item.email = email;
            if (phone) item.phone = phone;
            contact = item;
            return item;
        }
        return item;
    });
    if (!contact) {
        throw HttpError(404);
    }
    await updateContacts(updatedContacts);
    return contact;
};

export default {
    listContacts,
    getContactById,
    removeContact,
    addContact,
    updateContact,
};
