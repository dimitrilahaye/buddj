import { DomainEventMap, DomainEventName } from "../../events/DomainEventMap.js";

/**
 * Publication d'un événement de domaine.
 * Synchrone pour l'appelant : les handlers s'exécutent hors du chemin de la requête.
 */
export default interface EventPublisher {
  publish<K extends DomainEventName>(name: K, payload: DomainEventMap[K]): void;
}
