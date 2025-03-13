// Made by Hyper Crx
import axios from 'axios';
import { Account, Email } from './types';

const API_URL = 'https://api.guerrillamail.com/ajax.php';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

export const createAccount = async (): Promise<Account> => {
  try {
    const { data } = await api.get('', {
      params: {
        f: 'get_email_address',
        ip: '127.0.0.1',
        agent: 'Mozilla_5.0'
      }
    });

    return {
      email_addr: data.email_addr,
      sid_token: data.sid_token,
      email_timestamp: data.email_timestamp
    };
  } catch (error: any) {
    throw new Error('Failed to create email address. Please try again.');
  }
};

export const getMessages = async (sidToken: string): Promise<Email[]> => {
  try {
    const { data } = await api.get('', {
      params: {
        f: 'get_email_list',
        offset: 0,
        sid_token: sidToken
      }
    });

    return data.list || [];
  } catch (error) {
    throw new Error('Failed to fetch messages');
  }
};

export const getMessage = async (sidToken: string, id: string): Promise<Email> => {
  try {
    const { data } = await api.get('', {
      params: {
        f: 'fetch_email',
        email_id: id,
        sid_token: sidToken
      }
    });

    return {
      ...data,
      content: {
        mail_body: data.mail_body
      }
    };
  } catch (error) {
    throw new Error('Failed to fetch message details');
  }
};

export const setEmailAddress = async (sidToken: string, emailUser: string): Promise<void> => {
  try {
    await api.get('', {
      params: {
        f: 'set_email_user',
        email_user: emailUser,
        sid_token: sidToken
      }
    });
  } catch (error) {
    throw new Error('Failed to update email address');
  }
};

export const forgetMe = async (sidToken: string): Promise<void> => {
  try {
    await api.get('', {
      params: {
        f: 'forget_me',
        sid_token: sidToken
      }
    });
  } catch (error) {
    throw new Error('Failed to delete account');
  }
};