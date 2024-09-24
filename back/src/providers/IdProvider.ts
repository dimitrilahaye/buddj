import { v4 as uuidv4 } from 'uuid';
import IdProviderInterface from '../core/ports/providers/IdProvider.js'

export default class IdProvider implements IdProviderInterface {
    get(): string {
        return uuidv4();
    }
}
