import * as React from 'react';

export type ArcPathProps = {
  x: number;
  y: number;
  startDegrees: number;
  endDegrees: number;
  radius: number;
  id?: string;
};

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var largeArcFlag = '0';
  if (endAngle >= startAngle) {
    largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  } else {
    largeArcFlag = endAngle + 360.0 - startAngle <= 180 ? '0' : '1';
  }

  var d = [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');

  return d;
}

export function ArcPath({
  id,
  startDegrees,
  endDegrees,
  radius,
  x,
  y,
}: ArcPathProps) {
  return (
    <path
      id={id}
      fill="none"
      stroke="white"
      strokeWidth="3"
      d={describeArc(x, y, radius, startDegrees, endDegrees)}
    />
  );
}
