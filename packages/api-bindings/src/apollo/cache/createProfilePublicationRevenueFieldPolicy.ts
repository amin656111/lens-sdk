import { cursorBasedPagination } from './utils/cursorBasedPagination';

export function createProfilePublicationRevenueFieldPolicy() {
  return cursorBasedPagination([['request', ['profileId', 'publicationTypes', 'sources']]]);
}
