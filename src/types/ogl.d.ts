declare module 'ogl' {
    export class Renderer {
        constructor(options?: { dpr?: number; alpha?: boolean; width?: number; height?: number });
        gl: WebGLRenderingContext | WebGL2RenderingContext;
        dpr: number;
        setSize(width: number, height: number): void;
        render(options: { scene: any; camera?: any }): void;
    }
    export class Program {
        constructor(gl: any, options: { vertex: string; fragment: string; uniforms?: any });
    }
    export class Geometry {
        constructor(gl: any, attributes?: any);
    }
    export class Triangle extends Geometry { }
    export class Mesh {
        constructor(gl: any, options: { geometry: any; program: any });
    }
}
