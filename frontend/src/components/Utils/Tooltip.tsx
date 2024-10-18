import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Placement } from 'react-bootstrap/esm/types';

export function CustomTooltip(p: { children: JSX.Element, text: string, position: Placement }) {
  return (
    <OverlayTrigger
      placement={p.position}
      delay={{ show: 250, hide: 250 }}
      overlay={
        <Tooltip>
          {p.text}
        </Tooltip>
      }
    >
      {p.children}
    </OverlayTrigger>
  )
}