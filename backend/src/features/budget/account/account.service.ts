import { selectAccounts } from './use-cases/selectAccounts';
import { deleteAccountById } from './use-cases/deleteAccountById';
import { userOwnsAccount } from './use-cases/userOwnsAccount';
import { initialiseAccount } from './use-cases/initialiseAccount';

export const accountService = {
    getAccounts: selectAccounts,
    deleteAccount: deleteAccountById,
    initialiseNewAccount: initialiseAccount,

    checkUserOwnsAccount: userOwnsAccount,
};