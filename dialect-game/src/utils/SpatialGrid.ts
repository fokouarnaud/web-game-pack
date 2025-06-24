/**
 * Spatial Grid for efficient collision detection
 * Divides the game world into a grid to quickly find nearby objects
 */

import type { GameObject, BoundingBox, Position } from '../types';

export class SpatialGrid {
  private cellSize: number;
  private cols: number;
  private rows: number;
  private grid: Set<GameObject>[][];
  private worldWidth: number;
  private worldHeight: number;

  constructor(worldWidth: number, worldHeight: number, cellSize: number = 64) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.cellSize = cellSize;
    this.cols = Math.ceil(worldWidth / cellSize);
    this.rows = Math.ceil(worldHeight / cellSize);
    
    this.grid = [];
    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col] = new Set<GameObject>();
      }
    }
  }

  /**
   * Clear all objects from the grid
   */
  clear(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col].clear();
      }
    }
  }

  /**
   * Add an object to the grid
   */
  insert(obj: GameObject): void {
    const cells = this.getCells(obj.boundingBox);
    for (const { row, col } of cells) {
      if (this.isValidCell(row, col)) {
        this.grid[row][col].add(obj);
      }
    }
  }

  /**
   * Remove an object from the grid
   */
  remove(obj: GameObject): void {
    const cells = this.getCells(obj.boundingBox);
    for (const { row, col } of cells) {
      if (this.isValidCell(row, col)) {
        this.grid[row][col].delete(obj);
      }
    }
  }

  /**
   * Get all objects that could potentially collide with the given bounding box
   */
  queryRange(boundingBox: BoundingBox): GameObject[] {
    const objects = new Set<GameObject>();
    const cells = this.getCells(boundingBox);
    
    for (const { row, col } of cells) {
      if (this.isValidCell(row, col)) {
        for (const obj of this.grid[row][col]) {
          objects.add(obj);
        }
      }
    }
    
    return Array.from(objects);
  }

  /**
   * Get all objects near a position within a radius
   */
  queryRadius(position: Position, radius: number): GameObject[] {
    const boundingBox: BoundingBox = {
      x: position.x - radius,
      y: position.y - radius,
      width: radius * 2,
      height: radius * 2
    };
    
    return this.queryRange(boundingBox);
  }

  /**
   * Get grid cells that intersect with a bounding box
   */
  private getCells(boundingBox: BoundingBox): Array<{ row: number; col: number }> {
    const cells: Array<{ row: number; col: number }> = [];
    
    const startCol = Math.floor(boundingBox.x / this.cellSize);
    const endCol = Math.floor((boundingBox.x + boundingBox.width) / this.cellSize);
    const startRow = Math.floor(boundingBox.y / this.cellSize);
    const endRow = Math.floor((boundingBox.y + boundingBox.height) / this.cellSize);
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        cells.push({ row, col });
      }
    }
    
    return cells;
  }

  /**
   * Check if a grid cell is valid
   */
  private isValidCell(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  /**
   * Get statistics about the grid
   */
  getStats(): {
    totalCells: number;
    occupiedCells: number;
    totalObjects: number;
    averageObjectsPerCell: number;
    maxObjectsInCell: number;
  } {
    let occupiedCells = 0;
    let totalObjects = 0;
    let maxObjectsInCell = 0;
    
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cellSize = this.grid[row][col].size;
        if (cellSize > 0) {
          occupiedCells++;
          totalObjects += cellSize;
          maxObjectsInCell = Math.max(maxObjectsInCell, cellSize);
        }
      }
    }
    
    return {
      totalCells: this.rows * this.cols,
      occupiedCells,
      totalObjects,
      averageObjectsPerCell: occupiedCells > 0 ? totalObjects / occupiedCells : 0,
      maxObjectsInCell
    };
  }

  /**
   * Check if two bounding boxes overlap
   */
  static checkCollision(a: BoundingBox, b: BoundingBox): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }
}