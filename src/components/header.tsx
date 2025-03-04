import { v4 as uuidv4 } from 'uuid';

import { ComponentType } from './component';
import styles from './header.module.css';
import { useStore } from './store';

export const HeaderItem = ({
  label,
  type
}: {
  label: string;
  type: ComponentType;
}) => {
  const { addComponent } = useStore();

  return (
    <button
      className={`${styles.item} ${styles[type]}`}
      onClick={() =>
        addComponent({
          type,
          key: uuidv4(),
          props: {}
        })
      }
    >
      {label}
    </button>
  );
};

export const Header = () => {
  return (
    <div className={styles.header}>
      <HeaderItem label="Beam Block" type="beamBlock" />
      <HeaderItem label="Mirror" type="mirror" />
      <HeaderItem label="Ray" type="ray" />
    </div>
  );
};
