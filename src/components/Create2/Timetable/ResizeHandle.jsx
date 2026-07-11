import React from 'react';

export const resizeStyles = `
  .react-resizable-handle {
    position: absolute;
    left: 0;
    right: 0;
    height: 14px;
    z-index: 50;
    cursor: row-resize;
    display: flex;
    justify-content: center;
    touch-action: none;
  }
  .react-resizable-handle::after {
    content: "";
    width: 24px;
    height: 4px;
    background-color: rgba(0,0,0,0.15);
    border-radius: 2px;
    transition: background-color 0.2s;
  }
  .react-resizable-handle:hover::after {
    background-color: rgba(0,0,0,0.65);
  }
  .react-resizable-handle-s { bottom: 0; align-items: flex-end; padding-bottom: 3px; }
  .react-resizable-handle-n { top: 0; align-items: flex-start; padding-top: 3px; }
`;

const ResizeHandle = React.forwardRef((props, ref) => {
  const { handleAxis, ...restProps } = props;
  return (
    <div
      ref={ref}
      className={`react-resizable-handle react-resizable-handle-${handleAxis}`}
      {...restProps}
      onPointerDown={(e) => { e.stopPropagation(); restProps.onPointerDown && restProps.onPointerDown(e); }}
      onMouseDown={(e) => { e.stopPropagation(); restProps.onMouseDown && restProps.onMouseDown(e); }}
      onTouchStart={(e) => { e.stopPropagation(); restProps.onTouchStart && restProps.onTouchStart(e); }}
      onClick={(e) => e.stopPropagation()}
    />
  );
});

export default ResizeHandle;