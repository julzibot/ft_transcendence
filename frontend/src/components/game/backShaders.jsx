export const shaders = {};

shaders.orbvs = `
    uniform float u_time;
    uniform float u_ballSpeed;
    uniform float u_impactTime;
    uniform vec2  u_resolution;
    varying vec3    pos;
    varying float stress;
    varying float impactTimeFactor;

    vec3 mod289(vec3 x)
    {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 mod289(vec4 x)
    {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 permute(vec4 x)
    {
        return mod289(((x*34.0)+10.0)*x);
    }
    
    vec4 taylorInvSqrt(vec4 r)
    {
        return 1.79284291400159 - 0.85373472095314 * r;
    }
    
    vec3 fade(vec3 t) {
        return t*t*t*(t*(t*6.0-15.0)+10.0);
    }

    float cnoise(vec3 P)
    {
        vec3 Pi0 = floor(P); // Integer part for indexing
        vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
        Pi0 = mod289(Pi0);
        Pi1 = mod289(Pi1);
        vec3 Pf0 = fract(P); // Fractional part for interpolation
        vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        vec4 iy = vec4(Pi0.yy, Pi1.yy);
        vec4 iz0 = Pi0.zzzz;
        vec4 iz1 = Pi1.zzzz;

        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);

        vec4 gx0 = ixy0 * (1.0 / 7.0);
        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
        gx0 = fract(gx0);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        vec4 sz0 = step(gz0, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        gy0 -= sz0 * (step(0.0, gy0) - 0.5);

        vec4 gx1 = ixy1 * (1.0 / 7.0);
        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
        gx1 = fract(gx1);
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        vec4 sz1 = step(gz1, vec4(0.0));
        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        gy1 -= sz1 * (step(0.0, gy1) - 0.5);

        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
        g000 *= norm0.x;
        g010 *= norm0.y;
        g100 *= norm0.z;
        g110 *= norm0.w;
        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
        g001 *= norm1.x;
        g011 *= norm1.y;
        g101 *= norm1.z;
        g111 *= norm1.w;

        float n000 = dot(g000, Pf0);
        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
        float n111 = dot(g111, Pf1);

        vec3 fade_xyz = fade(Pf0);
        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
        return 2.2 * n_xyz;
    }

    void main()
    {
        stress = max(0.93, u_ballSpeed);
        impactTimeFactor = 0.;
        float burstTime = 250.;
        if (u_time - u_impactTime < burstTime)
            impactTimeFactor = (u_time - u_impactTime) / burstTime;
        else if (u_time - u_impactTime < 3500.)
            impactTimeFactor = 1. - (u_time - u_impactTime - burstTime) / (3500. - burstTime);
        vec3 displacement = (normal * cnoise(position + u_time / 6000.)) / (10. - 9.85 * stress * impactTimeFactor);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + displacement, 1.);
        pos = position + displacement * 1.5;
    }
`;

shaders.orbfs = `
    uniform float u_time;
    uniform vec2 u_resolution;
    varying vec3 pos;
    varying float stress;
    varying float impactTimeFactor;

    vec3 palette(float t, int mode)
    {
        vec3 a = vec3(0.);
        vec3 b = vec3(0.);
        vec3 c = vec3(0.);
        vec3 d = vec3(0.);
        if (mode == 1)
        {
            a = vec3(0.5, 0.5, 0.5);
            b = vec3(0.5, 0.5, 0.5);
            c = vec3(1.0, 1.0, 1.0);
            d = vec3(0.25, 0.4, 0.55);
        }
        else if (mode == 2)
        {
            a = vec3(0., 0.538, 0.288);
            b = vec3(0., -0.362, 0.668);
            c = vec3(0., 0.318, 0.248);
            d = vec3(0., 0.198, 0.698);
        }
        else if (mode == 3)
        {
            a = vec3(0.588, 0.498, 0.588);
            b = vec3(-0.472, -0.472, 0.318);
            c = vec3(0.408, 1.638, 0.268);
            d = vec3(2.088, 1.238, 1.008);
        }

        else if (mode == 4)
        {
            a = vec3(0.668, 0.668, 0.498);
            b = vec3(0.138, 0.500, 0.248);
            c = vec3(1.000, -0.112, 0.318);
            d = vec3(-0.092, 0.718, 0.538);
        }
        return abs(a + b * cos(6.28 * (c*t+d))); 
    }

    void main()
    {
        float len = length(pos);
        float distorsion = abs(len - 2.5) * (1. - stress * impactTimeFactor / 1.25);
        float spots = distorsion < 0.06 ? 0.2 : 0.;
        float paletteParam = pos.x / 35. + u_time / 70000.;
        vec3 color = palette(paletteParam, 3);
        gl_FragColor = vec4(color, min(1., distorsion * 12. + 0.2));
    }
`;

shaders.backfs = `
    uniform float u_time;
    uniform vec2 u_resolution;

    float grid(vec2 uv, float battery, int mode)
    {
        vec2 size = vec2(0.);
        if (mode == 0)
        {
            size = vec2(uv.y, uv.y * uv.y * 0.2) * 0.01;
            uv += vec2(0.0, u_time / 3000. * (battery + 0.05));
        }
        else
        {
            size = vec2(uv.x * uv.x * 0.2, abs(uv.x)) * 0.01;
            uv += vec2((u_time + 2800.) / 3000. * (battery + 0.05), 0.0);
        }
        uv = abs(fract(uv) - 0.5);
        vec2 lines = smoothstep(size, vec2(0.0), uv);
        lines += smoothstep(size * 5.0, vec2(0.0), uv) * 0.4 * battery;
        return clamp(lines.x + lines.y, 0.0, 3.0);
    }

    void main()
    {
        vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
        float fog = sqrt(uv.x * uv.x + uv.y * uv.y);
        float battery = 0.5;
        vec3 color = vec3(0., 0.05, 0.05);
        float side = 0.;
        float gridVal = 0.;

        if (uv.x * (u_resolution.y / u_resolution.x) < uv.y && uv.x < -0.9)
            side = -1.;
        else if (uv.x * (-u_resolution.y / u_resolution.x) < uv.y && uv.x > 0.9)
            side = 1.;
        if (side == -1. || side == 1.)
        {
            uv.x = 4.5 / (abs(uv.x - side * 0.2) + 0.05);
            uv.y *= abs(uv.x) * 1.5;
            gridVal = grid(uv, battery, 1);
        }
        else if (uv.y < -0.5)
        {
            side = 2.;
            uv.y = 2.0 / (abs(uv.y + 0.2) + 0.05);
            uv.x *= uv.y * 1.5;
            gridVal = grid(uv, battery, 0);
        }
        if (side != 0.)
        {
            color = mix(color, vec3(1.0, 0.5, 1.0), gridVal);
            color += vec3(1.2 - fog);
        }
        else if (fog < 0.22)
            color += vec3(smoothstep(0.22, 0., fog) * 1.9);
        gl_FragColor = vec4(color, 1.);
    }
`;

shaders.orbwrapfs = `
    uniform float u_time;

    void main()
    {
        vec3 color = vec3(1., 1., 1.);
        gl_FragColor = vec4(color, 1.);
    }
`;