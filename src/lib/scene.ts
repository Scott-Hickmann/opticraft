import { type RenderableObject } from './objects/renderableObject';
import { type Transform } from './types';

export class Scene {
  private objects: Array<{
    object: RenderableObject;
    transform: Transform;
  }> = [];

  private sceneTransform: Transform = {
    scale: 1.0,
    translateX: 0.0,
    translateY: 0.0,
    rotateX: 0.0,
    rotateY: 0.0,
    lastRotateX: 0.0,
    lastRotateY: 0.0
  };

  addObject(object: RenderableObject, transform?: Partial<Transform>): void {
    this.objects.push({
      object,
      transform: {
        scale: 1.0,
        translateX: 0.0,
        translateY: 0.0,
        rotateX: 0.0,
        rotateY: 0.0,
        lastRotateX: 0.0,
        lastRotateY: 0.0,
        ...transform
      }
    });
  }

  getObjects() {
    return this.objects;
  }

  getSceneTransform(): Transform {
    return this.sceneTransform;
  }

  updateSceneTransform(transform: Partial<Transform>): void {
    this.sceneTransform = {
      ...this.sceneTransform,
      ...transform
    };
  }

  updateTransform(index: number, transform: Partial<Transform>): void {
    console.log('Scene updating transform:', {
      index,
      transform,
      currentTransform: this.objects[index]?.transform
    });
    if (this.objects[index]) {
      this.objects[index].transform = {
        ...this.objects[index].transform,
        ...transform
      };
      console.log('Updated transform:', this.objects[index].transform);
    }
  }
}
