import {
  DomainEventHandler,
  DomainEventName,
} from "../../events/DomainEventMap.js";

export default interface EventSubscriber {
  subscribe<K extends DomainEventName>(
    name: K,
    handler: DomainEventHandler<K>
  ): void;
}
