import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class B2bPathService {

  constructor() { }

  getCurvePath(origX: number, origY: number, destX: number, destY: number, sc: number) {
    var lineCurveScale = 0.75,
      node_width = 100,
      node_height = 30;
    var dy = destY - origY;
    var dx = destX - origX;
    var delta = Math.sqrt(dy * dy + dx * dx);
    var scale = lineCurveScale;
    var scaleY = 0;
    if (dx * sc > 0) {
      if (delta < node_width) {
        scale = 0.75 - 0.75 * ((node_width - delta) / node_width);
      }
    } else {
      scale = 0.4 - 0.2 * (Math.max(0, (node_width - Math.min(Math.abs(dx), Math.abs(dy))) / node_width));
    }
    if (dx * sc > 0) {
      return "M " + origX + " " + origY +
        " C " + (origX + sc * (node_width * scale)) + " " + (origY + scaleY * node_height) + " " +
        (destX - sc * (scale) * node_width) + " " + (destY - scaleY * node_height) + " " +
        destX + " " + destY
    } else {

      var midX = Math.floor(destX - dx / 2);
      var midY = Math.floor(destY - dy / 2);
      //
      if (dy === 0) {
        midY = destY + node_height;
      }
      var cp_height = node_height / 2;
      var y1 = (destY + midY) / 2
      var topX = origX + sc * node_width * scale;
      var topY = dy > 0 ? Math.min(y1 - dy / 2, origY + cp_height) : Math.max(y1 - dy / 2, origY - cp_height);
      var bottomX = destX - sc * node_width * scale;
      var bottomY = dy > 0 ? Math.max(y1, destY - cp_height) : Math.min(y1, destY + cp_height);
      var x1 = (origX + topX) / 2;
      var scy = dy > 0 ? 1 : -1;
      var cp = [
        // Orig -> Top
        [x1, origY],
        [topX, dy > 0 ? Math.max(origY, topY - cp_height) : Math.min(origY, topY + cp_height)],
        // Top -> Mid
        // [Mirror previous cp]
        [x1, dy > 0 ? Math.min(midY, topY + cp_height) : Math.max(midY, topY - cp_height)],
        // Mid -> Bottom
        // [Mirror previous cp]
        [bottomX, dy > 0 ? Math.max(midY, bottomY - cp_height) : Math.min(midY, bottomY + cp_height)],
        // Bottom -> Dest
        // [Mirror previous cp]
        [(destX + bottomX) / 2, destY]
      ];
      if (cp[2][1] === topY + scy * cp_height) {
        if (Math.abs(dy) < cp_height * 10) {
          cp[1][1] = topY - scy * cp_height / 2;
          cp[3][1] = bottomY - scy * cp_height / 2;
        }
        cp[2][0] = topX;
      }
      return "M " + origX + " " + origY +
        " C " +
        cp[0][0] + " " + cp[0][1] + " " +
        cp[1][0] + " " + cp[1][1] + " " +
        topX + " " + topY +
        " S " +
        cp[2][0] + " " + cp[2][1] + " " +
        midX + " " + midY +
        " S " +
        cp[3][0] + " " + cp[3][1] + " " +
        bottomX + " " + bottomY +
        " S " +
        cp[4][0] + " " + cp[4][1] + " " +
        destX + " " + destY
    }
  }

  getElbowPath(origX: number, origY: number, destX: number, destY: number, radius?: number) {
    let x1 = origX;
    let x2 = destX;
    let y1 = origY;
    let y2 = destY;
    if (!radius || radius < 5) {
      radius = 5;
    }

    let midX = x1 + (Math.abs(x2 - x1) / 2);
    let midY = y1 + (Math.abs(y2 - y1) / 2);
    let midXn = x2 - (Math.abs(x2 - x1) / 2);
    let midYn = y2 - (Math.abs(y2 - y1) / 2);
    let segments = [];
    if (Math.abs((y2 - y1)) > (radius * 2)) {
      if (x1 > x2) {
        if (y2 > y1) {
          segments.push(`M${x1},${y1}`);
          segments.push(`L${midX - radius},${y1}`);
          segments.push(`C ${midX - radius},${y1} ${midX},${y1} ${midX},${y1 + radius}`);
          segments.push(`L${midX},${midY - radius}`);
          segments.push(`C ${midX},${midY - radius} ${midX},${midY} ${midX - radius},${midY}`);
          segments.push(`L${midXn + radius},${midY}`);
          segments.push(`C ${midXn + radius},${midY} ${midXn},${midY} ${midXn},${midY + radius}`);
          segments.push(`L${midXn},${y2 - radius}`);
          segments.push(`C ${midXn},${y2 - radius} ${midXn},${y2} ${midXn + radius},${y2}`);
          segments.push(`L${x2},${y2}`);
        } else {
          segments.push(`M${x1},${y1}`);
          segments.push(`L${midX - radius},${y1}`);
          segments.push(`C ${midX - radius},${y1} ${midX},${y1} ${midX},${y1 + radius}`);
          segments.push(`L${midX},${midY - radius}`);
          segments.push(`C ${midX},${midY - radius} ${midX},${midY} ${midX - radius},${midY}`);
          segments.push(`L${midXn + radius},${midY}`);
          segments.push(`C ${midXn + radius},${midY} ${midXn},${midY} ${midXn},${midY - radius}`);
          segments.push(`L${midXn},${y2 + radius}`);
          segments.push(`C ${midXn},${y2 + radius} ${midXn},${y2} ${midXn + radius},${y2}`);
          segments.push(`L${x2},${y2}`);
        }
      } else {
        if (y2 > y1) {
          segments.push(`M${x1},${y1}`);
          segments.push(`L${midX - radius},${y1}`);
          segments.push(`C ${midX - radius},${y1} ${midX},${y1} ${midX},${y1 + radius}`);
          segments.push(`L${midX},${y2 - radius}`);
          segments.push(`C ${midX},${y2 - radius} ${midX},${y2} ${midX + radius},${y2}`);
          segments.push(`L${x2},${y2}`);
        } else {
          segments.push(`M${x1},${y1}`);
          segments.push(`L${midX - radius},${y1}`);
          segments.push(`C ${midX - radius},${y1} ${midX},${y1} ${midX},${y1 - radius}`);
          segments.push(`L${midX},${y2 + radius}`);
          segments.push(`C ${midX},${y2 + radius} ${midX},${y2} ${midX + radius},${y2}`);
          segments.push(`L${x2},${y2}`);
        }
      }
    } else {
      segments.push(`M${x1},${y1}`);
      segments.push(`L${x2},${y2}`);
    }
    return segments.join(' ');
  }
}
