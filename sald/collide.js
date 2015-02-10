
/* Circle vs Circle
 * INPUT: two circles specified by position and radius:
 *  c1 = {x:, y:, r:}, c2 = {x:, y:, r:}
 * RETURN VALUE:
 *  false if c1 and c2 do not intersect
 *  true if c1 and c2 do intersect
 */
function circleCircle(c1,c2) {
	
	var centerDistanceSquare = Math.pow((c2.x-c1.x),2) + Math.pow((c2.y-c1.y),2);
	
	return (centerDistanceSquare < Math.pow((c1.r + c2.r),2));
}

/* Rectangle vs Rectangle
 * INPUT: rectangles specified by their minimum and maximum extents:
 *  r = {min:{x:, y:}, max:{x:, y:}}
 * RETURN VALUE:
 *  false if r1 and r2 do not intersect
 *  true if r1 and r2 do intersect
 */
function rectangleRectangle(r1, r2) {
	var r1width = (r1.max.x - r1.min.x);
	var r1height = (r1.max.y - r1.min.y);

	var r2width = (r2.max.x - r2.min.x);
	var r2height = (r2.max.y - r2.min.y);	
	
	return (r1.min.x < r2.min.x + r2width &&
   r1.min.x + r1width > r2.min.x &&
   r1.min.y < r2.min.y + r2height &&
   r1height + r1.min.y > r2.min.y);
}

/* Convex vs Convex
 * INPUT: convex polygons as lists of vertices in CCW order
 *  p = [{x:,y:}, ..., {x:, y:}]
 * RETURN VALUE:
 *  false if p1 and p2 do not intersect
 *  true if p1 and p2 do intersect
 */

function orientation(p,q,r)
{
	var val = (q.y-p.y)*(r.x-q.x)-(q.x-p.x)*(r.y-q.y);

	if(val == 0) return 0; //colinear
	return (val > 0)?1:2; //cw or anti-cw
}

function onSegment(p,q,r)
{
	if(q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
	q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
		return true;
	
	return false;
}

function doIntersect(p1,q1,p2,q2) //line p1q1 and line p2q2
{
	var o1 = orientation(p1,q1,p2);
	var o2 = orientation(p1,q1,q2);
	var o3 = orientation(p2,q2,p1);
	var o4 = orientation(p2,q2,q1);

	if(o1 != o2 && o3 != o4)
		return true;
	//bunch of special cases	
	 // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    	if (o1 == 0 && onSegment(p1, p2, q1)) return true;

	// p1, q1 and p2 are colinear and q2 lies on segment p1q1
	if (o2 == 0 && onSegment(p1, q2, q1)) return true;

	// p2, q2 and p1 are colinear and p1 lies on segment p2q2
	if (o3 == 0 && onSegment(p2, p1, q2)) return true;

	// p2, q2 and q1 are colinear and q1 lies on segment p2q2
	if (o4 == 0 && onSegment(p2, q1, q2)) return true;	


	return false;
}

//doesn't work 
function convexConvex(p1, p2) {
	
	var extreme = p1[0];
	var n = p1.length;
	extreme.x = Number.POSITIVE_INFINITY;
	
	//check if points of p2 lie inside p1
	for(var check=0;check<p2.length;check++)
	{	
	extreme.y = p2[check].y;
	
	var count = 0, i=0;

	do
	{
		var next = (i+1)%n;
	
		if(doIntersect(p1[i], p1[next], p2[check], extreme))
		{
			if(orientation(p1[i], p2[check], p1[next]) == 0)
				return onSegment(p1[i], p2[check], p1[next]);

			count++;
		}

	i = next;
	}while(i!= 0);
	}

	return count&1;	
}

/* Rav vs Circle
 * INPUT: ray specified as a start and end point, circle as above.
 *  ray = {start:{x:, y:}, end:{x:, y:}}
 * RETURN VALUE:
 *  null if no intersection
 *  {t:} if intersection
 *    -- NOTE: 0.0 <= t <= 1.0 gives the position of the first intersection
 */

function rayCircle(r, c) 
{
	var A = r.start;
	A.x = r.start.x;
	A.y = r.start.y;

	var B = r.end;
	B.x = r.end.x;
	B.y = r.end.y;

	// compute the euclidean distance between A and B
	var LAB = Math.sqrt( (B.x-A.x)*(B.x-A.x) + (B.y-A.y)*(B.y-A.y) );

	// compute the direction vector D from A to B
	var Dx = (B.x-A.x)/LAB;
	var Dy = (B.y-A.y)/LAB;

	// Now the line equation is x = Dx*t + Ax, y = Dy*t + Ay with 0 <= t <= 1.

	// compute the value t of the closest point to the circle center (Cx, Cy)
	var t = Dx*(c.x-A.x) + Dy*(c.y-A.y);

	// This is the projection of C on the line from A to B.

	// compute the coordinates of the point E on line and closest to C
	var Ex = t*Dx+A.x;
	var Ey = t*Dy+A.y;

	// compute the euclidean distance from E to C
	var LEC = Math.sqrt( (Ex-c.x)*(Ex-c.x) + (Ey-c.y)*(Ey-c.y) );

	// test if the line intersects the circle
	if( LEC < c.r )
	{
	    // compute distance from t to circle intersection point
	    var dt = Math.sqrt( c.r*c.r - LEC*LEC);

	    // compute first intersection point
	    var Fx = (t-dt)*Dx + A.x;
	    var Fy = (t-dt)*Dy + A.y;
	    
	    // compute second intersection point
	    var Gx = (t+dt)*Dx + A.x;
	    var Gy = (t+dt)*Dy + A.y;
		
	    var dxc1 = Fx - B.x;
	    var dyc1 = Fy - B.y;

	    var dxc2 = Gx - B.x;
	    var dyc2 = Gy - B.y;

	    var dxl = B.x - A.x;
	    var dyl = B.y - A.y;

	    var cross1 = dxc1 * dyl - dyc1 * dxl;
	    var cross2 = dxc2 * dyl - dyc2 * dxl;

	    var flag1 = false, flag2 = false;
	    
		
            if (Math.abs(dxl) >= Math.abs(dyl))
		  flag1 = dxl > 0 ? 
		    A.x <= Fx && Fx <= B.x :
		    B2.x <= Fx && Fx <= A.x;
		else
		  flag1 = dyl > 0 ? 
		    A.y <= Fy && Fy <= B.y :
		    B.y <= Fy && Fy <= A.y;
			

	    if (Math.abs(dxl) >= Math.abs(dyl))
		   flag2 = dxl > 0 ? 
		    A.x <= Gx && Gx <= B.x :
		    B2.x <= Gx && Gx <= A.x;
		  else
		    flag2 = dyl > 0 ? 
		     A.y <= Gy && Gy <= B.y :
		     B.y <= Gy && Gy <= A.y;
	
	    if(flag1 || flag2)
		{
			return true;
		}
		
	}

	// else test if the line is tangent to circle
	//else if( LEC == c.r )
	    // tangent point to circle is E

	//else
	    // line doesn't touch circle
	return false;
	
}

/* Rav vs Rectangle
 * INPUT: ray as above, rectangle as above.
 * RETURN VALUE:
 *  null if no intersection
 *  {t:} if intersection
 *    -- NOTE: 0.0 <= t <= 1.0 gives the position of the first intersection
 */
function rayRectangle(r, b) {
	
	{
	var x1 = r.start.x;
	var y1 = r.start.y;
	var x2 = r.end.x;
	var y2 = r.end.y;

	var minX = b.min.x;
	var minY = b.min.y;
	var maxX = b.max.x;
	var maxY = b.max.y;
  
    // Completely outside.
    if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY))
        return false;

    	var m = (y2 - y1) / (x2 - x1);

    	var y = m * (minX - x1) + y1;
    	
	if (y > minY && y < maxY) return true;

    	y = m * (maxX - x1) + y1;
    	if (y > minY && y < maxY) return true;

    	var x = (minY - y1) / m + x1;
    	if (x > minX && x < maxX) return true;

    	x = (maxY - y1) / m + x1;
    	if (x > minX && x < maxX) return true;

    	return false;
}
	
}
/* Rav vs Convex
 * INPUT: ray as above, convex polygon as above.
 * RETURN VALUE:
 *  null if no intersection
 *  {t:} if intersection
 *    -- NOTE: 0.0 <= t <= 1.0 gives the position of the first intersection
 */
function rayConvex(r, p) {

	return null;
}


module.exports = {
	circleCircle: circleCircle,
	rectangleRectangle: rectangleRectangle,
	convexConvex: convexConvex,
	rayCircle: rayCircle,
	rayRectangle: rayRectangle,
	rayConvex: rayConvex
};
