import Icon from './Icon';

export function Skeleton({ h = 16, w = '100%', r = 10, style }) {
  return <span className="skeleton" style={{ height: h, width: w, borderRadius: r, ...style }} />;
}

/** A few placeholder cards while a list loads. */
export function ListSkeleton({ rows = 3, h = 88 }) {
  return (
    <div className="list">
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} h={h} r={18} />)}
    </div>
  );
}

export function Empty({ icon = 'layers', title = 'Nothing here yet', text, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={28} />
      </div>
      <h4>{title}</h4>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <Empty
      icon="info"
      title="Couldn’t load this"
      text={error?.message || 'Something went wrong.'}
      action={onRetry && <button className="btn btn-ghost btn-sm" onClick={() => onRetry()}><Icon name="refresh" size={16} /> Retry</button>}
    />
  );
}

export function Spinner({ size = 18 }) {
  return <span className="spinner" style={{ width: size, height: size }} />;
}
