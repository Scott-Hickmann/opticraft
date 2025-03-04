import * as THREE from 'three';

import { canScale, Component } from './component';
import styles from './sidePanel.module.css';
import { useStore } from './store';

const Vector3Component = ({
  value,
  onChange
}: {
  value: number;
  onChange?: (value: number) => void;
}) => {
  return (
    <input
      className={styles.vector3Component}
      type="number"
      value={value.toFixed(6)}
      onChange={(e) => onChange?.(parseFloat(e.target.value))}
    />
  );
};

const Vector3 = ({
  value: [x, y, z],
  onChange
}: {
  value: [number, number, number];
  onChange?: (value: [number, number, number]) => void;
}) => {
  return (
    <div className={styles.vector3}>
      <Vector3Component value={x} onChange={(x) => onChange?.([x, y, z])} />
      <Vector3Component value={y} onChange={(y) => onChange?.([x, y, z])} />
      <Vector3Component value={z} onChange={(z) => onChange?.([x, y, z])} />
    </div>
  );
};

interface ComponentEditorProps {
  activeComponent: Component;
}

const ComponentEditor = ({ activeComponent }: ComponentEditorProps) => {
  const { updateComponent, removeComponent } = useStore();

  return (
    <>
      <h3 className={styles.activeTitle}>
        {activeComponent.type}
        <br />({activeComponent?.key})
      </h3>
      {activeComponent.props.position && (
        <>
          <Vector3
            value={[
              activeComponent.props.position.x,
              activeComponent.props.position.y,
              activeComponent.props.position.z
            ]}
            onChange={(position) => {
              const [x, y, z] = position;
              updateComponent(activeComponent.key, {
                ...activeComponent,
                props: {
                  ...activeComponent.props,
                  position: new THREE.Vector3(x, y, z)
                }
              });
            }}
          />
          {activeComponent.props.rotation && (
            <Vector3
              value={[
                (activeComponent.props.rotation.x * 180) / Math.PI,
                (activeComponent.props.rotation.y * 180) / Math.PI,
                (activeComponent.props.rotation.z * 180) / Math.PI
              ]}
              onChange={(rotation) => {
                const [x, y, z] = rotation;
                const rotationEuler = new THREE.Euler(
                  (x * Math.PI) / 180,
                  (y * Math.PI) / 180,
                  (z * Math.PI) / 180
                );
                updateComponent(activeComponent.key, {
                  ...activeComponent,
                  props: {
                    ...activeComponent.props,
                    rotation: rotationEuler
                  }
                });
              }}
            />
          )}
          {activeComponent.props.scale && canScale(activeComponent.type) && (
            <Vector3
              value={[
                activeComponent.props.scale.x,
                activeComponent.props.scale.y,
                activeComponent.props.scale.z
              ]}
              onChange={(scale) => {
                const [x, y, z] = scale;
                updateComponent(activeComponent.key, {
                  ...activeComponent,
                  props: {
                    ...activeComponent.props,
                    scale: new THREE.Vector3(x, y, z)
                  }
                });
              }}
            />
          )}
        </>
      )}
      <button onClick={() => removeComponent(activeComponent.key)}>
        Remove
      </button>
    </>
  );
};

export const SidePanel = () => {
  const { active, getComponent } = useStore();

  const activeComponent = active ? getComponent(active) : null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Editor</h2>
      {activeComponent && <ComponentEditor activeComponent={activeComponent} />}
    </div>
  );
};
