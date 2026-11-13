import { EventEmitter } from "node:events";
import EventPublisher from "../../core/ports/providers/EventPublisher.js";
import EventSubscriber from "../../core/ports/providers/EventSubscriber.js";
import {
  DomainEventHandler,
  DomainEventMap,
  DomainEventName,
} from "../../core/events/DomainEventMap.js";

type Logger = Pick<Console, "error">;

/**
 * Bus d'événements en mémoire.
 * `publish` rend la main immédiatement : chaque handler est planifié sur la
 * boucle d'événements (setImmediate) et ses erreurs sont loggées, jamais remontées.
 */
export default class NodeEventBus implements EventPublisher, EventSubscriber {
  private readonly emitter = new EventEmitter();

  constructor(private readonly logger: Logger = console) {}

  publish<K extends DomainEventName>(name: K, payload: DomainEventMap[K]): void {
    this.emitter.emit(name, payload);
  }

  subscribe<K extends DomainEventName>(
    name: K,
    handler: DomainEventHandler<K>
  ): void {
    this.emitter.on(name, (payload: DomainEventMap[K]) => {
      setImmediate(() => {
        Promise.resolve()
          .then(() => handler(payload))
          .catch((error) => {
            this.logger.error(`[events] handler for "${name}" failed`, error);
          });
      });
    });
  }
}
