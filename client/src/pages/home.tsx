import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  details: z.string().min(10, "Tell us a bit more"),
});

/* ============================================
   SIMPLEX NOISE - For organic blob movement
   ============================================ */
class SimplexNoise {
  private perm: number[] = [];
  
  constructor(seed = Math.random()) {
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    
    let n: number;
    let q: number;
    for (let i = 255; i > 0; i--) {
      seed = ((seed * 16807) % 2147483647);
      n = seed % (i + 1);
      q = p[i];
      p[i] = p[n];
      p[n] = q;
    }
    
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }
  
  noise2D(x: number, y: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = x - X0;
    const y0 = y - Y0;
    
    let i1: number, j1: number;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }
    
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    
    const ii = i & 255;
    const jj = j & 255;
    
    let n0 = 0, n1 = 0, n2 = 0;
    
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      const gi0 = this.perm[ii + this.perm[jj]] % 12;
      n0 = t0 * t0 * this.dot2(gi0, x0, y0);
    }
    
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
      n1 = t1 * t1 * this.dot2(gi1, x1, y1);
    }
    
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
      n2 = t2 * t2 * this.dot2(gi2, x2, y2);
    }
    
    return 70 * (n0 + n1 + n2);
  }
  
  private dot2(gi: number, x: number, y: number): number {
    const grad = [
      [1, 1], [-1, 1], [1, -1], [-1, -1],
      [1, 0], [-1, 0], [1, 0], [-1, 0],
      [0, 1], [0, -1], [0, 1], [0, -1]
    ][gi];
    return grad[0] * x + grad[1] * y;
  }
}

/* ============================================
   SVG PATH PARSER - Extracts points from silhouette SVG
   ============================================ */
function parseSVGPath(pathData: string, numSamples: number = 360): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  
  // Create a temporary SVG to use the browser's path parsing
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  svg.appendChild(path);
  document.body.appendChild(svg);
  
  const pathLength = path.getTotalLength();
  
  for (let i = 0; i < numSamples; i++) {
    const point = path.getPointAtLength((i / numSamples) * pathLength);
    points.push({ x: point.x, y: point.y });
  }
  
  document.body.removeChild(svg);
  return points;
}

/* ============================================
   Convert points to polar coordinates from center
   ============================================ */
function pointsToPolar(points: { x: number; y: number }[], viewBox: { width: number; height: number }): number[] {
  const centerX = viewBox.width / 2;
  const centerY = viewBox.height / 2;
  const maxDim = Math.max(viewBox.width, viewBox.height) / 2;
  
  // Create array of 360 radius values (one per degree)
  const rawRadii: number[] = new Array(360).fill(0);
  const counts: number[] = new Array(360).fill(0);
  
  points.forEach(point => {
    const dx = point.x - centerX;
    const dy = point.y - centerY;
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += Math.PI * 2;
    
    const radius = Math.sqrt(dx * dx + dy * dy) / maxDim;
    const angleDeg = Math.round(angle * (180 / Math.PI)) % 360;
    
    // Keep maximum radius for outer contour
    if (radius > rawRadii[angleDeg]) {
      rawRadii[angleDeg] = radius;
    }
    counts[angleDeg]++;
  });
  
  // Fill gaps with interpolated values
  for (let i = 0; i < 360; i++) {
    if (counts[i] === 0) {
      // Find nearest neighbors with values
      let prev = i - 1;
      let next = i + 1;
      while (prev >= 0 && counts[(prev + 360) % 360] === 0) prev--;
      while (next < 720 && counts[next % 360] === 0) next++;
      
      const prevIdx = (prev + 360) % 360;
      const nextIdx = next % 360;
      const t = (i - prev) / (next - prev);
      rawRadii[i] = rawRadii[prevIdx] * (1 - t) + rawRadii[nextIdx] * t;
    }
  }
  
  // Apply Gaussian smoothing (key for removing spiny artifacts)
  const smoothed: number[] = new Array(360).fill(0);
  const kernelSize = 25; // Smooth over 25 degrees each side
  
  for (let i = 0; i < 360; i++) {
    let sum = 0;
    let weightSum = 0;
    
    for (let j = -kernelSize; j <= kernelSize; j++) {
      const idx = (i + j + 360) % 360;
      // Gaussian weight - closer angles have more influence
      const weight = Math.exp(-(j * j) / (2 * (kernelSize / 2) * (kernelSize / 2)));
      sum += rawRadii[idx] * weight;
      weightSum += weight;
    }
    
    smoothed[i] = sum / weightSum;
  }
  
  return smoothed;
}

/* ============================================
   MORPHING BLOB - Transforms into human silhouettes
   ============================================ */
function MorphingBlob({ mouseX, mouseY, scrollProgress, isCtaHover }: { mouseX: number; mouseY: number; scrollProgress: number; isCtaHover: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simplex = useMemo(() => new SimplexNoise(42), []);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [silhouettes, setSilhouettes] = useState<number[][]>([]);
  
  // Color palettes - smooth continuous transition between these
  const colorPalettes = useMemo(() => [
    // Electric blue - trust, digital presence
    [
      { r: 60, g: 120, b: 255 },
      { r: 80, g: 160, b: 255 },
      { r: 120, g: 200, b: 255 },
      { r: 200, g: 235, b: 255 },
    ],
    // Teal/Cyan - direct, confident, engaging
    [
      { r: 40, g: 180, b: 180 },
      { r: 60, g: 210, b: 200 },
      { r: 100, g: 235, b: 220 },
      { r: 180, g: 250, b: 245 },
    ],
    // Vibrant Green/Gold - victory, growth, celebration
    [
      { r: 80, g: 200, b: 120 },
      { r: 120, g: 220, b: 150 },
      { r: 170, g: 240, b: 180 },
      { r: 220, g: 255, b: 220 },
    ],
  ], []);
  
  // SVG path data for silhouettes - 3 distinct energies
  const silhouettePaths = useMemo(() => [
    // Man portrait (head/shoulders) - original, works great - BLUE
    { 
      path: "M614.597 47.9972C639.247 48.9329 650.585 50.8853 672.793 63.3374C670.472 60.9367 664.602 57.2313 661.125 54.0088C673.461 58.4189 674.638 57.9732 685.886 66.0736C680.903 59.7727 678.158 57.1985 672.097 52.0257C688.355 58.0448 697.641 64.8292 707.954 78.742C705.495 71.7513 700.75 66.5583 696.722 60.479C701.37 63.2319 710.412 76.5381 713.278 81.4491L720.23 94.7777C719.186 90.011 717.496 85.5406 715.636 81.0478C714.799 78.8875 711.435 73.132 711.704 72.3283C718.483 77.7343 731.516 104.889 732.269 114.064C733.219 125.649 732.362 133.065 725.309 142.348L726.027 142.087C729.673 140.743 732.019 139.429 733.728 135.679C733.904 135.29 734.072 134.897 734.233 134.501L734.941 134.953C735.568 138.982 727.176 147.086 724.307 149.736C732.618 153.768 733.792 155.401 739.709 162.5C735.05 158.931 730.181 155.646 725.128 152.662C730.693 158.555 736.544 165.024 738.737 173.103C737.133 171.435 736.094 169.691 734.815 167.766C737.96 176.72 740.279 184.312 740.804 193.98C741.073 198.916 740.828 203.937 741.115 208.777L738.501 200.655C738.543 202.87 738.865 208.887 738.239 210.623C737.103 209.406 736.904 207.875 736.403 206.167C735.345 214.826 735.451 222.074 739.083 230.296C742.111 237.149 746.588 240.045 746.507 248.06C746.386 260.145 736.686 268.387 735.529 279.793C734.521 289.743 738.517 300.689 740.41 310.516C741.444 316.031 741.832 321.648 741.567 327.253C740.991 342.163 733.892 361.257 730.759 376.296C728.239 387.148 728.265 398.544 726.365 409.454C724.343 420.405 720.647 430.977 717.801 441.731C715.17 451.666 713.842 461.579 710.009 471.168C702.609 489.683 681.707 488.226 666.313 493.366C665.124 500.596 664.031 508.452 664.231 515.82C664.399 522.004 668.801 528.267 669.884 533.876C671.659 543.062 672.076 548.145 678.278 555.928C683.274 562.198 688.277 570.506 694.19 576.138C700.631 580.867 713.793 586.813 721.4 590.656L767.259 613.95C786.79 623.64 806.387 632.213 826.794 639.801C840.499 644.897 851.747 646.379 862.496 657.24C901.45 696.603 903.484 762.397 910.137 813.756L928.324 959.599C931.111 981.431 933.535 1002.2 936.871 1024L75.9044 1024C77.0352 1017.71 77.8585 1009.01 78.8052 1002.37C80.764 989.145 82.8482 975.938 85.0573 962.752C86.8143 952.189 89.4512 942.227 91.4207 931.764C92.0389 928.48 90.6769 922.435 90.1249 918.887C88.2004 906.517 92.3263 896.741 97.3981 885.636C95.1404 876.265 93.8317 864.795 95.0347 855.247C95.903 845.518 100.334 836.089 102.249 826.688C105.579 810.342 109.368 795.688 115.144 780.053C117.535 773.579 117.465 759.64 118.806 752.189C122.311 732.712 126.523 713.478 133.896 695.032C141.15 676.393 155.117 650.544 171.486 639.081C174.262 637.137 188.948 630.942 193.887 628.056C205.058 621.529 222.696 612.84 234.829 609.578C250.218 605.44 262.315 604.89 277.484 597.719C302.711 585.791 326.687 571.646 351.338 558.629C361.992 553.004 373.851 548.281 384.946 543.419C390.516 535.098 402.286 525.032 409.742 515.896C413.168 511.635 416.475 507.28 419.659 502.835C427.832 491.266 428.171 487.9 443.159 484.764C445.144 480.987 446.963 476.783 449.005 473.089C454.887 462.444 460.203 453.59 461.351 441.124C462.066 433.36 461.671 425.603 461.477 417.762C454.169 411.954 455.5 406.335 451.545 399.799C443.344 386.246 438.594 371.803 431.737 357.673C432.137 359.237 433.106 362.326 432.914 363.769C428.485 354.964 427.576 344.799 423.924 335.912C421.182 329.239 416.851 323.265 414.006 316.216C413.117 314.037 412.382 311.798 411.806 309.517C409.511 300.26 411.535 293.132 410.566 284.079C409.78 276.736 407.108 268.393 405.884 261.044C405.135 256.545 405.14 251.309 404.572 246.708C402.683 231.387 400.926 209.921 403.857 194.628C402.608 197.235 401.178 199.938 399.858 202.526C404.51 173.596 411.894 147.52 431.844 124.948C442.386 113.02 451.093 103.885 460.643 90.9545L461.414 90.6898L461.008 90.5337L461.511 90.226C460.625 92.9577 459.697 95.4994 458.704 98.1901C459.031 97.8011 459.363 97.4164 459.7 97.0361C487.55 66.0091 519.029 54.562 559.741 54.984C569.972 55.0901 584.65 55.5095 594.455 54.8755C592.846 54.1214 586.799 51.6144 586.174 50.4782C590.788 50.9994 593.612 52.6155 599.294 52.3949C609.448 52.0008 616.83 50.8966 627.107 51.7112C622.982 50.5871 618.707 49.2312 614.597 47.9972Z",
      viewBox: { width: 1024, height: 1024 }
    },
    // Front-facing silhouette - direct, confident, engaging - TEAL
    { 
      path: "M455.448 168.767C498.714 154.498 574.211 148.414 595.743 203.31C596.56 205.392 597.176 210.161 598.268 211.609C607.978 211.969 612.326 213.275 619.247 220.945C639.853 243.78 646.804 283.376 645.381 313.457C644.678 328.316 639.58 347.591 636.994 362.741C641.122 359.918 647.833 354.984 651.922 360.882C653.762 363.537 654.479 369.719 654.168 373.111C652.884 387.094 648.285 401.834 646.618 415.795C645.59 424.399 635.479 439.498 628.036 443.956C624.526 444.029 623.087 444.018 619.636 443.353C618.007 455.903 616.743 468.156 613.248 480.367C611.77 485.533 607.305 492.061 606.753 496.767C604.781 513.567 606.924 532.97 606.196 549.405L606.703 549.934C610.492 553.943 611.231 556.332 614.27 560.57C617.042 564.271 620.489 567.737 623.349 571.339C630.055 579.783 636.627 587.89 645.622 594.074C652.549 598.836 660.542 604.049 668.363 607.158C679.479 611.406 690.331 615.783 701.273 620.489C722.093 629.443 742.849 640.539 764.059 648.43C791.519 658.647 820.666 665.228 848.223 675.243C851.382 676.391 852.654 677.812 854.906 680.097L855.267 680.474C859.032 679.808 860.893 680.15 864.198 682.269C872.231 687.415 874.451 698.523 876.095 707.262C877.899 716.852 878.016 727.339 879.755 736.906C881.51 746.56 886.696 755.763 889.08 765.361C890.869 772.566 890.047 781.495 891.343 788.453C894.658 806.265 899.429 824.248 901.554 842.286C902.769 852.149 903.065 862.104 902.436 872.022C901.985 879.272 900.08 892.391 901.396 899.007C903.839 911.242 907.565 923.263 910.379 935.419C913.81 950.239 916.681 965.394 918.994 980.435C921.121 994.263 924.098 1010.07 924.573 1024L105.869 1024C106.238 1013.91 108.768 999.172 110.441 989.051C113.624 969.325 117.392 949.698 121.742 930.195C123.911 920.672 126.692 911.245 128.569 901.641C130.602 891.242 127.92 880.154 127.602 869.696C126.796 843.227 135.223 817.353 140.399 791.663C142.164 783.34 141.106 774.41 143.227 766.173C145.71 756.531 151.014 747.678 153.133 737.937C154.71 730.681 154.995 722.777 155.835 715.543C157.48 701.377 159.518 679.579 178.649 680.542C179.016 680.56 185.4 675.034 186.547 674.921C209.65 667.134 233.684 661.714 256.689 653.701C282.381 644.752 306.813 631.997 331.783 621.259C342.607 616.499 356.54 612.429 366.328 607.393C373.086 603.837 379.474 599.619 385.399 594.801C392.864 588.821 399.535 581.83 405.291 574.178C409.666 568.363 414.987 563.073 418.791 556.902C420.86 553.548 422.696 550.966 425.171 547.931C425.597 532.728 425.973 512.039 424.556 496.752C424.411 495.188 420.961 488.532 420.077 486.666C417.994 482.302 416.393 477.725 415.304 473.014C413.255 464.231 412.635 451.718 410.512 444.003C408.406 443.632 406.767 444.109 404.991 443.951C395.292 443.086 388.303 429.009 385.249 420.976C382.824 414.601 383.035 406.393 381.748 399.72C380.208 391.554 377.38 385.253 376.861 376.589C376.477 370.178 375.274 356.047 386.137 358.114C387.646 358.401 391.542 360.903 392.968 361.792C384.379 331.381 379.643 293.285 386.736 262.12C388.8 253.055 393.653 242.019 398.178 233.94C401.659 227.745 405.466 221.739 409.584 215.948C406.089 218.41 403.834 220.061 400.64 222.864C414.376 196.767 437.105 180.536 464.433 170.389L455.448 168.767Z",
      viewBox: { width: 1024, height: 1024 }
    },
    // Celebrate silhouette - hands up, victory energy - GREEN
    { 
      path: "M908.229 158.974C911.443 155.914 915.648 151.103 919.999 150.798C923.498 151.787 923.364 154.036 923.491 157.084C926.652 162.297 927.184 158.867 929.803 167.134C945.14 164.42 941.646 177.328 944.837 178.079C957.573 181.078 954.59 195.115 949.873 203.303C955.429 216.222 956.424 228.445 951.484 242.005C949.338 247.895 944.642 254.009 942.283 260.251C936.491 275.581 931.106 291.575 926.001 307.146C929.333 309.583 932.036 311.427 934.807 314.535C931.347 324.289 925.485 334.337 922.33 343.35C927.694 346.949 931.932 349.998 936.459 354.605C928.009 367.251 919.285 381.248 910.381 393.283C897.184 411.123 886.222 427.656 876.903 447.891C873.111 456.124 866.694 464.428 862.396 472.528C856.092 482.872 856.452 492.716 850.514 502.747C846.665 509.251 837.124 512.029 833.27 517.574C829.55 522.925 830.494 531.476 825.608 537.346C816.945 547.753 806.527 556.249 797.981 566.917C789.463 577.55 788.196 586.866 778.401 596.907C765.822 609.8 753.049 622.087 740.201 634.73C732.724 642.088 724.36 649.887 717.306 657.593C715.18 659.915 710.688 667.093 708.913 669.871C717.76 717.145 721.845 765.317 730.335 812.693C732.569 825.161 734.084 837.848 736.509 850.289C739.129 863.948 746.565 880.415 747.605 894.492C747.736 896.267 746.389 899.096 745.619 900.692L760.259 978.928C762.974 993.149 766.8 1010.03 768.957 1024L255.805 1024L279.496 897.858C274.721 891.871 278.637 884.047 280.6 877.186C282.603 870.164 284.556 863.129 286.461 856.08C289.144 845.846 290.964 833.169 292.754 822.501C297.781 792.781 302.208 762.961 306.033 733.062C307.839 719.715 309.758 706.384 311.79 693.07C312.74 686.729 314.087 676.215 315.595 670.254C313.629 666.928 310.47 660.726 307.991 657.704C302.327 650.798 295.503 645.722 289.212 639.123C272.143 621.217 250.289 605.001 237.071 583.964C233.931 578.965 232.662 573.163 228.48 568.648C219.129 556.904 207.474 547.178 197.876 535.738C194.262 531.43 194.86 523.39 192.114 518.632C187.987 511.925 177.791 509.471 173.49 501.976C168.018 492.439 168.497 483.038 162.626 473.286C157.773 465.732 153.509 457.39 148.825 449.8C143.361 440.948 138.462 426.763 132.542 418.775C116.938 397.724 102.555 375.798 87.9045 354.179C93.0231 349.393 96.3325 346.625 102.213 342.84C98.9745 335.777 95.7746 328.785 92.8639 321.582C89.0186 312.066 91.0747 311.742 99.0872 306.973C93.0986 290.773 88.2559 273.973 81.9948 257.805C79.18 250.536 74.0365 245.282 72.6589 237.863C70.1359 224.277 70.0871 215.939 74.6576 203.191C70.8248 196.451 68.3218 185.132 75.4762 179.598C77.3448 178.152 80.8322 179.266 81.3705 176.233C82.8744 167.763 85.8702 165.466 95.186 167.153C100.004 156.365 105.99 152.255 116.348 160.665C117.81 158.297 119.111 156.518 121.964 155.872C125.405 155.093 128.962 156.639 131.77 158.511C136.948 161.963 142.754 168.059 145.171 173.855C146.438 176.894 147.214 180.256 148.375 183.362C149.502 186.38 151.109 189.49 151.649 192.681C154.043 206.816 124.882 226.065 129.4 248.128C130.923 255.561 141.716 274.468 145.711 282.76C146.854 283.325 147.195 283.207 148.502 283.267C152.403 285.588 163.546 315.705 166.775 314.463C167.013 314.372 168.075 313.673 168.316 313.517C169.454 313.697 169.541 313.486 170.24 314.626C180.163 330.804 188.723 347.706 197.666 364.424C200.565 369.844 205.354 375.163 208.703 380.401C216.458 391.462 224.415 402.189 231.797 413.551C235.661 419.46 239.272 425.531 242.621 431.747C245.679 437.403 248.498 443.434 252.266 448.577C261.396 461.041 272.742 468.268 284.326 477.83C288.485 481.263 289.607 490.676 293.354 494.595C295.491 496.837 301.129 498.826 304.162 501.189C311.583 506.969 314.901 513.764 320.349 520.988C323.015 524.523 330.562 526.495 332.71 531.141C335.071 535.191 336.427 540.834 336.664 545.455C345.297 547.152 352.12 550.872 360.253 553.067C362.523 538.629 373.959 526.662 389.789 528.07C394.338 528.475 395.489 532.693 398.655 535.03C416.605 546.781 434.503 557.124 448.139 574.136C452.05 567.243 458.081 560.427 464.112 555.302C464.024 553.472 463.677 545.579 463.296 544.369C461.635 539.087 459.45 535.302 457.854 529.71C456.722 525.744 456.34 515.903 455.583 514.02C449.108 512.803 448.912 513.495 444.736 507.509C440.933 502.057 435.629 475.755 436.744 469.389C436.972 468.086 437.332 467.274 438.222 466.265C440.935 464.804 442.73 465.893 445.413 466.845C439.107 443.576 435.095 417.641 447.985 396.001C449.416 393.599 450.908 391.234 452.199 388.765L451.847 388.471C450.593 389.111 450.224 389.601 449.11 389.43C455.749 376.437 470.314 367.5 483.381 362.287C482.115 361.498 482.13 361.626 480.66 361.173C482.035 359.229 492.351 357.647 494.936 357.25C519.64 353.453 550.31 356.421 558.157 384.416C578.175 384.4 583.555 421.851 583.473 436.651C583.41 447.997 580.106 456.818 579.035 467.447C582.036 465.729 584.195 464.208 587.07 466.982C590.338 474.143 584.675 504.031 577.799 510.165C574.004 513.549 573.71 514.058 568.825 513.456C568.421 517.468 567.323 527.611 566.297 530.906C562.53 543.003 561.419 543.015 561.475 556.009C566.41 563.036 572.433 569.207 576.994 576.267C582.422 561.683 600.418 551.914 612.744 543.345C617.148 540.33 622.956 537.724 626.506 533.747C629.686 530.185 632.827 528.432 637.721 528.811C653.266 530.015 661.882 539.064 664.804 553.392C672.495 550.146 679.275 547.187 687.423 545.224C691.109 527.997 691.276 531.452 703.322 521.533C709.151 516.733 714.37 503.691 722.97 499.872C725.866 498.135 728.936 496.283 731.896 494.518C734.874 489.352 735.492 484.99 738.982 479.939C743.539 473.343 750.818 470.445 756.124 465.896C761.022 461.698 768.467 453.389 772.711 448.483C775.719 445.006 779.928 436.601 782.308 432.206C785.644 425.901 789.236 419.734 793.074 413.721C803.206 397.897 815.044 382.791 825.521 367.161C828.736 362.364 831.276 357.09 833.924 351.971C838.545 343.077 843.404 334.308 848.497 325.675C850.379 322.413 852.206 319.139 854.057 315.861C855.161 313.907 857.377 314.21 859.202 314.421C863.893 309.184 868.14 296.996 871.836 290.685C874.771 285.673 873.011 284.579 879.535 282.232C883.106 275.993 893.911 254.954 895.223 248.782C896.065 244.818 895.823 240.439 894.787 236.539C891.498 224.148 872.947 203.877 872.668 196.258C872.531 192.523 874.465 188.355 875.585 184.813C876.952 180.491 878.154 176.08 880.386 172.109C883.757 166.112 890.845 157.715 897.656 155.822C900.301 155.086 903.031 155.25 905.389 156.724C906.409 157.361 907.326 158.184 908.229 158.974Z",
      viewBox: { width: 1024, height: 1024 }
    },
  ], []);
  
  // Load and parse all silhouettes
  useEffect(() => {
    try {
      const parsedSilhouettes = silhouettePaths.map(sil => {
        const points = parseSVGPath(sil.path, 1440);
        return pointsToPolar(points, sil.viewBox);
      });
      setSilhouettes(parsedSilhouettes);
    } catch (e) {
      console.log('Silhouette parsing delayed until DOM ready');
    }
  }, [silhouettePaths]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Get silhouette radius with smooth interpolation
    const getSilhouetteRadius = (silhouetteData: number[], angleDeg: number): number => {
      if (!silhouetteData || silhouetteData.length === 0) return 1;
      
      const normalizedAngle = ((angleDeg % 360) + 360) % 360;
      const floor = Math.floor(normalizedAngle);
      const ceil = (floor + 1) % 360;
      const t = normalizedAngle - floor;
      
      const r0 = silhouetteData[(floor - 1 + 360) % 360];
      const r1 = silhouetteData[floor];
      const r2 = silhouetteData[ceil];
      const r3 = silhouetteData[(ceil + 1) % 360];
      
      const t2 = t * t;
      const t3 = t2 * t;
      return 0.5 * (
        (2 * r1) +
        (-r0 + r2) * t +
        (2 * r0 - 5 * r1 + 4 * r2 - r3) * t2 +
        (-r0 + 3 * r1 - 3 * r2 + r3) * t3
      );
    };
    
    // Smooth blend between multiple colors using continuous time
    const getBlendedColor = (t: number, layer: number) => {
      const numPalettes = colorPalettes.length;
      // Slow, continuous color cycle - takes ~45 seconds to go through all colors
      const colorTime = (t * 0.022) % numPalettes;
      const paletteIndex = Math.floor(colorTime);
      const blendT = colorTime - paletteIndex;
      
      // Smooth easing for color transitions
      const smoothT = blendT * blendT * (3 - 2 * blendT);
      
      const c1 = colorPalettes[paletteIndex][layer];
      const c2 = colorPalettes[(paletteIndex + 1) % numPalettes][layer];
      
      return {
        r: Math.round(c1.r * (1 - smoothT) + c2.r * smoothT),
        g: Math.round(c1.g * (1 - smoothT) + c2.g * smoothT),
        b: Math.round(c1.b * (1 - smoothT) + c2.b * smoothT),
      };
    };
    
    // Animation timing for silhouette morphing
    const BLOB_DURATION = 5;
    const MORPH_DURATION = 3;
    const SILHOUETTE_DURATION = 4;
    const TOTAL_CYCLE = BLOB_DURATION + MORPH_DURATION + SILHOUETTE_DURATION + MORPH_DURATION;
    
    const animate = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      
      // Calculate which silhouette we're morphing to
      const numSilhouettes = silhouettes.length || 1;
      const fullCycleTime = t % (TOTAL_CYCLE * numSilhouettes);
      const currentCycleIndex = Math.floor(fullCycleTime / TOTAL_CYCLE);
      const cycleTime = fullCycleTime % TOTAL_CYCLE;
      
      const currentSilIndex = currentCycleIndex % numSilhouettes;
      
      let morphAmount = 0;
      
      if (cycleTime < BLOB_DURATION) {
        morphAmount = 0;
      } else if (cycleTime < BLOB_DURATION + MORPH_DURATION) {
        morphAmount = (cycleTime - BLOB_DURATION) / MORPH_DURATION;
        morphAmount = morphAmount * morphAmount * (3 - 2 * morphAmount);
      } else if (cycleTime < BLOB_DURATION + MORPH_DURATION + SILHOUETTE_DURATION) {
        morphAmount = 1;
      } else {
        morphAmount = 1 - (cycleTime - BLOB_DURATION - MORPH_DURATION - SILHOUETTE_DURATION) / MORPH_DURATION;
        morphAmount = morphAmount * morphAmount * (3 - 2 * morphAmount);
      }
      
      // 85% max morph - more human, still organic
      const maxMorph = 0.88;
      const actualMorph = morphAmount * maxMorph;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = window.innerWidth * 0.65 + (mouseX - window.innerWidth / 2) * 0.08;
      const centerY = window.innerHeight * 0.48 + (mouseY - window.innerHeight / 2) * 0.06 - scrollProgress * 150;
      
      const baseRadius = Math.min(window.innerWidth, window.innerHeight) * 0.32;
      
      const currentSilData = silhouettes[currentSilIndex];
      
      let corePoints: { x: number; y: number }[] = [];
      
      // Draw layers
      for (let layer = 0; layer < 4; layer++) {
        const layerOffset = layer * 0.3;
        const layerOpacity = 0.28 - layer * 0.04;
        const layerRadius = baseRadius * (1 - layer * 0.12);
        
        ctx.beginPath();
        
        const numPoints = 360;
        const layerPoints: { x: number; y: number }[] = [];
        
        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const angleDeg = (i / numPoints) * 360;
          
          const slowT = t * 0.06;
          const noise1 = simplex.noise2D(Math.cos(angle) * 1.5 + slowT + layerOffset, Math.sin(angle) * 1.5 + slowT) * 0.18;
          const noise2 = simplex.noise2D(Math.cos(angle) * 3 + slowT * 0.7, Math.sin(angle) * 3 + slowT * 0.7) * 0.07;
          const noise3 = simplex.noise2D(Math.cos(angle) * 5 + slowT * 0.5, Math.sin(angle) * 5 + slowT * 0.5) * 0.03;
          
          const blobRadius = 1 + noise1 + noise2 + noise3;
          
          const silRadius = currentSilData ? getSilhouetteRadius(currentSilData, angleDeg) * 1.15 : 1;
          const blendedRadius = blobRadius * (1 - actualMorph) + silRadius * actualMorph;
          
          const organicPulse = (noise1 * 0.08 + noise2 * 0.04) * (0.2 + actualMorph * 0.08);
          const breathe = Math.sin(t * 0.35 + angle * 2) * 0.008;
          
          const finalRadius = blendedRadius + organicPulse + breathe;
          const r = layerRadius * finalRadius;
          
          const x = centerX + r * Math.cos(angle);
          const y = centerY + r * Math.sin(angle);
          
          layerPoints.push({ x, y });
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        if (layer === 3) corePoints = layerPoints;
        
        ctx.closePath();
        
        // Smooth continuous color from time
        const color = getBlendedColor(t, layer);
        
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, layerRadius * 1.8
        );
        
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${layerOpacity * 1.2})`);
        gradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${layerOpacity * 0.8})`);
        gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, ${layerOpacity * 0.4})`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      // Organic core glow
      if (corePoints.length > 0) {
        const coreColor = getBlendedColor(t, 3);
        const coreScale = 0.32;
        
        ctx.beginPath();
        for (let i = 0; i <= corePoints.length - 1; i++) {
          const pt = corePoints[i];
          const dx = pt.x - centerX;
          const dy = pt.y - centerY;
          const angle = Math.atan2(dy, dx);
          const coreNoise = simplex.noise2D(Math.cos(angle) * 2 + t * 0.1, Math.sin(angle) * 2 + t * 0.1) * 0.06;
          const scaledX = centerX + dx * (coreScale + coreNoise);
          const scaledY = centerY + dy * (coreScale + coreNoise);
          
          if (i === 0) ctx.moveTo(scaledX, scaledY);
          else ctx.lineTo(scaledX, scaledY);
        }
        ctx.closePath();
        
        const coreGlow = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, baseRadius * 0.38
        );
        coreGlow.addColorStop(0, `rgba(255, 255, 255, 0.4)`);
        coreGlow.addColorStop(0.3, `rgba(${coreColor.r}, ${coreColor.g}, ${coreColor.b}, 0.28)`);
        coreGlow.addColorStop(0.6, `rgba(${coreColor.r}, ${coreColor.g}, ${coreColor.b}, 0.12)`);
        coreGlow.addColorStop(1, `rgba(${coreColor.r}, ${coreColor.g}, ${coreColor.b}, 0)`);
        
        ctx.fillStyle = coreGlow;
        ctx.fill();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [mouseX, mouseY, scrollProgress, simplex, silhouettes, colorPalettes]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
}

/* ============================================
   CUSTOM CURSOR - Enhanced
   ============================================ */
function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState("");

  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hoverElement = target.closest('[data-hover]');
      if (hoverElement) {
        setIsHovering(true);
        setCursorText(hoverElement.getAttribute('data-cursor-text') || "");
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-hover]')) {
        setIsHovering(false);
        setCursorText("");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        className="hidden lg:flex fixed pointer-events-none z-[9999] items-center justify-center rounded-full"
        style={{ 
          left: cursorXSpring, 
          top: cursorYSpring, 
          x: "-50%", 
          y: "-50%",
          backgroundColor: isHovering ? 'rgba(232, 220, 196, 0.9)' : 'transparent',
          border: isHovering ? 'none' : '1px solid rgba(232, 220, 196, 0.5)',
        }}
        animate={{
          width: isHovering ? 80 : 12,
          height: isHovering ? 80 : 12,
        }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {cursorText && isHovering && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[9px] tracking-[0.15em] uppercase font-medium text-black"
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>
    </>
  );
}

/* ============================================
   MAGNETIC BUTTON - Enhanced
   ============================================ */
function MagneticButton({ 
  children, 
  onClick, 
  className = "",
  cursorText = "",
  onMouseEnter,
  onMouseLeave
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  cursorText?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { damping: 15, stiffness: 150 });
  const ySpring = useSpring(y, { damping: 15, stiffness: 150 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.4);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.4);
  }, [x, y]);

  const handleMouseLeaveInternal = useCallback(() => { 
    x.set(0); 
    y.set(0); 
    onMouseLeave?.();
  }, [x, y, onMouseLeave]);

  const handleMouseEnterInternal = useCallback(() => {
    onMouseEnter?.();
  }, [onMouseEnter]);

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnterInternal}
      onMouseLeave={handleMouseLeaveInternal}
      style={{ x: xSpring, y: ySpring }}
      className={className}
      data-hover
      data-cursor-text={cursorText}
    >
      {children}
    </motion.button>
  );
}

/* ============================================
   SPLIT TEXT - For character animations
   ============================================ */
function SplitText({ 
  children, 
  className = "",
  delay = 0,
  stagger = 0.03
}: { 
  children: string; 
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const chars = children.split('');
  
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div className="flex flex-wrap">
        {chars.map((char, i) => (
          <motion.span
            key={i}
            initial={{ y: "100%", opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{
              duration: 0.8,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block"
            style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

/* ============================================
   FLOATING PARTICLES - Ambient motion
   ============================================ */
function FloatingParticles() {
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 10,
    })), 
  []);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden opacity-30">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[var(--cream)]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ============================================
   SCROLL PROGRESS BAR
   ============================================ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[1px] bg-[var(--cream)] origin-left z-[100]"
      style={{ scaleX }}
    />
  );
}

/* ============================================
   MAIN
   ============================================ */
export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ctaHover, setCtaHover] = useState(false);
  const { toast } = useToast();
  
  const { scrollYProgress } = useScroll();
  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [scrollValue, setScrollValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollProgress.on("change", (v) => setScrollValue(v));
    return () => unsubscribe();
  }, [scrollProgress]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", details: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("https://formspree.io/f/xnjaavby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setFormSuccess(true);
        form.reset();
        setTimeout(() => { setDialogOpen(false); setFormSuccess(false); }, 2500);
      } else {
        toast({ title: "Error", description: "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    }
  }

  // Parallax values for hero
  const heroY = useTransform(scrollProgress, [0, 0.3], [0, -150]);
  const heroOpacity = useTransform(scrollProgress, [0, 0.2], [1, 0]);

  return (
    <div className="bg-[#050505] text-white min-h-screen relative overflow-x-hidden">
      <div className="grain" />
      <CustomCursor />
      <MorphingBlob mouseX={mousePos.x} mouseY={mousePos.y} scrollProgress={scrollValue} isCtaHover={ctaHover} />
      <FloatingParticles />
      <ScrollProgress />
      <div className="curtain fixed inset-0 bg-[#050505] z-[100]" />

      {/* ============================================
          NAV
          ============================================ */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-6 md:py-8 mix-blend-difference"
      >
        <span className="text-[10px] tracking-[0.5em] uppercase text-white/60 font-light">
          Solo
        </span>
        <MagneticButton
          onClick={() => setDialogOpen(true)}
          className="text-[10px] tracking-[0.3em] uppercase text-white/60 hover:text-white transition-colors duration-700"
          cursorText="Let's talk"
        >
          Start a project
        </MagneticButton>
      </motion.nav>

      {/* ============================================
          HERO - Sculptural Typography with Blob
          ============================================ */}
      <motion.section 
        className="min-h-screen flex items-center relative z-10"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="w-full px-6 md:px-12 lg:px-20">
          {/* Asymmetric layout */}
          <div className="grid grid-cols-12 gap-4 items-end">
            {/* Left side - stacked */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-6">
              {/* Label */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: loaded ? 0.4 : 0, x: loaded ? 0 : -20 }}
                transition={{ duration: 1, delay: 2 }}
                className="mb-8"
              >
                <span className="text-[10px] tracking-[0.5em] uppercase font-light text-white/40">
                  Story-driven design
                </span>
              </motion.div>

              {/* Main headline - MASSIVE */}
              <div className="space-y-1 md:space-y-2">
                <div className="overflow-hidden">
                  <motion.h1
                    initial={{ y: "110%" }}
                    animate={{ y: loaded ? 0 : "110%" }}
                    transition={{ duration: 1.4, delay: 2.1, ease: [0.16, 1, 0.3, 1] }}
                    className="font-serif text-[10vw] md:text-[7vw] lg:text-[6vw] xl:text-[5vw] font-light leading-[1.1] tracking-[-0.02em] text-white/90"
                  >
                    Let's build
                  </motion.h1>
                </div>
                <div className="overflow-hidden pb-[0.15em]">
                  <motion.h1
                    initial={{ y: "110%" }}
                    animate={{ y: loaded ? 0 : "110%" }}
                    transition={{ duration: 1.4, delay: 2.25, ease: [0.16, 1, 0.3, 1] }}
                    className="font-serif text-[10vw] md:text-[7vw] lg:text-[6vw] xl:text-[5vw] font-light leading-[1.1] tracking-[-0.02em] italic text-[var(--cream)]"
                  >
                    your digital legacy.
                  </motion.h1>
                </div>
              </div>
            </div>

            {/* Right side - offset content */}
            <motion.div 
              className="col-span-12 lg:col-span-4 xl:col-span-5 lg:col-start-9 xl:col-start-8 mt-16 lg:mt-0 lg:pb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 30 }}
              transition={{ duration: 1, delay: 2.8 }}
            >
              <p className="text-[13px] md:text-[14px] text-white/30 font-light leading-[1.9] mb-10 max-w-sm">
                We interview you. Learn your story. Translate it into every pixel. 
                For those who refuse to blend in.
              </p>
              
              <div className="flex flex-wrap items-center gap-6">
                <MagneticButton
                  onClick={() => setDialogOpen(true)}
                  className="group relative overflow-hidden bg-[var(--cream)] hover:bg-white px-10 py-5 transition-all duration-700"
                  cursorText="Go"
                  onMouseEnter={() => setCtaHover(true)}
                  onMouseLeave={() => setCtaHover(false)}
                >
                  <span className="relative z-10 text-[10px] tracking-[0.3em] uppercase text-black font-medium flex items-center gap-3">
                    Start a conversation
                    <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </MagneticButton>
              </div>

              {/* Price - whispered */}
              <motion.div 
                className="mt-10 flex items-center gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: loaded ? 1 : 0 }}
                transition={{ duration: 1, delay: 3.2 }}
              >
                <span className="text-[12px] text-white/20 font-light tracking-wide">
                  $5,000 · 2 weeks
                </span>
                <span className="w-16 h-[1px] bg-white/10" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/15 font-light">
                  limited availability
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator - absolute bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 1, delay: 3.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[9px] tracking-[0.4em] uppercase text-white/20 font-light">
            Scroll
          </span>
          <div className="scroll-indicator w-[1px] h-16 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </motion.section>

      {/* ============================================
          THE CRAFT - Horizontal reveal section
          ============================================ */}
      <section className="relative py-40 md:py-56">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--cream)]/[0.02] to-transparent" />
        
        <div className="px-6 md:px-12 lg:px-20 max-w-[1800px] mx-auto relative z-10">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-20"
          >
            <span className="text-[10px] tracking-[0.5em] uppercase font-light text-[var(--cream)]/50">
              The Process
            </span>
          </motion.div>

          {/* Three pillars - asymmetric grid */}
          <div className="grid grid-cols-12 gap-y-20 md:gap-y-0">
            {[
              { 
                num: "01", 
                word: "Interview", 
                line: "We don't start with wireframes. We start with questions. Your story becomes our blueprint.",
                align: "col-span-12 md:col-span-4 md:col-start-1"
              },
              { 
                num: "02", 
                word: "Design", 
                line: "Every color, every curve, every word—chosen to reflect who you are, not who the template says you should be.",
                align: "col-span-12 md:col-span-4 md:col-start-5 md:mt-32"
              },
              { 
                num: "03", 
                word: "Launch", 
                line: "Two weeks. A site that makes people pause. That's the promise.",
                align: "col-span-12 md:col-span-4 md:col-start-9 md:mt-64"
              },
            ].map((item, i) => (
              <motion.div
                key={item.num}
                className={item.align}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: i * 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <span className="text-[10px] text-[var(--cream)]/30 font-light tracking-[0.3em] block mb-4">
                  {item.num}
                </span>
                <h3 className="font-serif text-[12vw] md:text-[6vw] lg:text-[4.5vw] font-light text-white/90 leading-[0.9] mb-6">
                  {item.word}
                </h3>
                <p className="text-[13px] text-white/25 font-light leading-[1.9] max-w-xs">
                  {item.line}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          THE STATEMENT - Full-bleed typography
          ============================================ */}
      <section className="py-32 md:py-48 relative overflow-hidden">
        <motion.div
          className="px-6 md:px-12 lg:px-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="max-w-[1600px] mx-auto relative">
            {/* Big quote */}
            <div className="relative">
              <motion.div
                className="absolute -top-10 -left-4 md:-left-8 text-[15vw] font-serif text-[var(--cream)]/[0.05] leading-none select-none"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
              >
                "
              </motion.div>
              
              <div className="relative z-10">
                <SplitText 
                  className="font-serif text-[7vw] md:text-[5vw] lg:text-[4vw] font-light leading-[1.15] text-white/80"
                  delay={0.3}
                  stagger={0.02}
                >
                  We don't make websites.
                </SplitText>
                <div className="h-4 md:h-6" />
                <SplitText 
                  className="font-serif text-[7vw] md:text-[5vw] lg:text-[4vw] font-light leading-[1.15] italic text-[var(--cream)]"
                  delay={0.8}
                  stagger={0.02}
                >
                  We create digital legacies.
                </SplitText>
              </div>
            </div>

            {/* Attribution */}
            <motion.div
              className="mt-16 md:mt-20 flex items-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              viewport={{ once: true }}
            >
              <span className="w-12 h-[1px] bg-white/10" />
              <span className="text-[11px] tracking-[0.3em] uppercase text-white/20 font-light">
                Solo Design Philosophy
              </span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ============================================
          FINAL CTA - The Close
          ============================================ */}
      <section className="py-40 md:py-56 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--cream)]/[0.02] to-transparent" />
        
        <div className="px-6 md:px-12 lg:px-20 relative z-10">
          <div className="max-w-[1400px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              {/* The big question */}
              <div className="mb-16">
                <div className="overflow-hidden">
                  <motion.h2
                    initial={{ y: "100%" }}
                    whileInView={{ y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="font-serif text-[18vw] md:text-[14vw] lg:text-[12vw] font-light leading-[0.85] tracking-[-0.04em] text-white/90"
                  >
                    Ready?
                  </motion.h2>
                </div>
              </div>

              {/* The details */}
              <div className="grid grid-cols-12 gap-8 items-end">
                <motion.div
                  className="col-span-12 md:col-span-5 lg:col-span-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <p className="text-[14px] text-white/30 font-light leading-[1.9] mb-10">
                    15 minutes. No pitch. Just a conversation about your story 
                    and whether we're the right fit to tell it.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <MagneticButton
                      onClick={() => setDialogOpen(true)}
                      className="group relative border border-white/10 hover:border-[var(--cream)]/40 hover:bg-[var(--cream)]/[0.03] px-10 py-5 transition-all duration-700"
                      cursorText="Let's go"
                    >
                      <span className="text-[10px] tracking-[0.3em] uppercase text-white/60 group-hover:text-[var(--cream)] transition-colors duration-500 font-light flex items-center gap-3">
                        Book a call
                        <svg className="w-4 h-4 text-white/30 group-hover:text-[var(--cream)] group-hover:translate-x-1 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </MagneticButton>
                  </div>
                </motion.div>

                <motion.div
                  className="col-span-12 md:col-span-4 md:col-start-9 text-right"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="inline-block">
                    <span className="text-[13px] text-white/20 font-light block mb-2">
                      $5,000 · 2 weeks
                    </span>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-white/10 font-light">
                      limited availability
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER - Minimal
          ============================================ */}
      <footer className="py-8 px-6 md:px-12 border-t border-white/[0.03] relative z-10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[10px] tracking-[0.5em] uppercase text-white/20 font-light">
            Solo Designs
          </span>
          <span className="text-[11px] text-white/10 font-light italic">
            For those who refuse to blend in.
          </span>
          <span className="text-[10px] text-white/10 font-light">
            © {new Date().getFullYear()}
          </span>
        </div>
      </footer>

      {/* ============================================
          DIALOG
          ============================================ */}
      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
          >
            <motion.div
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
              onClick={() => { setDialogOpen(false); setFormSuccess(false); }}
            />

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => { setDialogOpen(false); setFormSuccess(false); }}
              className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors duration-500 group"
              data-hover
              data-cursor-text="Close"
            >
              <svg className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-lg px-6"
            >
              <AnimatePresence mode="wait">
                {formSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24"
                  >
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-20 h-20 mx-auto mb-10 rounded-full border border-[var(--cream)]/20 flex items-center justify-center"
                    >
                      <svg className="w-8 h-8 text-[var(--cream)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <h3 className="font-serif text-4xl font-light mb-4">Got it.</h3>
                    <p className="text-white/30 text-[14px] font-light">We'll be in touch within 24 hours.</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" exit={{ opacity: 0 }}>
                    <div className="text-center mb-14">
                      <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">Let's talk.</h2>
                      <p className="text-white/30 text-[14px] font-light">Tell us about you and your vision.</p>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Your name"
                                  {...field}
                                  className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-5 focus-visible:ring-0 focus-visible:border-[var(--cream)]/50 placeholder:text-white/20 text-[16px] font-light transition-colors duration-500"
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] text-white/40 font-light mt-3" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Email"
                                  {...field}
                                  className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-5 focus-visible:ring-0 focus-visible:border-[var(--cream)]/50 placeholder:text-white/20 text-[16px] font-light transition-colors duration-500"
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] text-white/40 font-light mt-3" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="details"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="What's your story?"
                                  {...field}
                                  className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 py-5 focus-visible:ring-0 focus-visible:border-[var(--cream)]/50 placeholder:text-white/20 min-h-[120px] resize-none text-[16px] font-light transition-colors duration-500"
                                />
                              </FormControl>
                              <FormMessage className="text-[10px] text-white/40 font-light mt-3" />
                            </FormItem>
                          )}
                        />
                        <div className="pt-8">
                          <button
                            type="submit"
                            className="w-full bg-[var(--cream)] hover:bg-white text-black py-5 text-[11px] tracking-[0.3em] uppercase font-medium transition-colors duration-500"
                            data-hover
                            data-cursor-text="Send"
                          >
                            Send message
                          </button>
                        </div>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
