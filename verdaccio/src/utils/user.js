// @flow
import {stringToMD5} from '../lib/crypto-utils';


export const GRAVATAR_DEFAULT = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm';
/**
 * Generate gravatar url from email address
 */
export function generateGravatarUrl(email?: string): string {
  if (typeof email === 'string') {
    email = email.trim().toLocaleLowerCase();
    const emailMD5 = stringToMD5(email);

    return `https://www.gravatar.com/avatar/${emailMD5}`;
  } else {
    return GRAVATAR_DEFAULT;
  }
}
