import chalk from 'chalk';
import { WebSocket } from 'ws';

export class ConnectionManager {

  private connections: Map<string, WebSocket> = new Map();

  constructor() {}

  /**
   * Adds a new WebSocket connection to the manager.
   * @param id - The unique identifier for the connection.
   * @param socket - The WebSocket instance associated with the connection.
   */
  public addConnection(id: string, socket: WebSocket): void {
    this.connections.set(id, socket);
    console.log(chalk.greenBright(`New Connection added: ${id}`));
  }

  /**
   * Removes a WebSocket connection by ID and closes it.
   * @param id - The unique identifier for the connection.
   */
  public removeConnection(id: string): void {
    if (this.connections.has(id)) {
      const ws = this.connections.get(id);
      try {
        if (ws) ws.close();
        this.connections.delete(id);
        console.log(chalk.greenBright(`Connection removed: ${id}`));
      } catch (error) {
        console.error(chalk.redBright(`Failed to remove connection: ${id}, Error: ${error}`));
      }
    }
  }

  /**
   * Closes all active WebSocket connections and clears the manager.
   */
  public closeAllConnections(): void {
    this.connections.forEach((ws, id) => {
      this.removeConnection(id);
    });
    this.connections.clear();
  }

  /**
   * Retrieves all active WebSocket connections.
   * @returns A map of connection IDs to WebSocket instances.
   */
  public getConnections(): Map<string, WebSocket> {
    return this.connections;
  }

  /**
   * Retrieves all active connection IDs.
   * @returns An array of connection IDs.
   */
  public getConnectionIds(): string[] {
    return Array.from(this.connections.keys());
  }
}