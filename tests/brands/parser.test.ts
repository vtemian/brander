import { describe, it, expect } from "bun:test";
import { parseBrandXml } from "../../src/brands/parser";

const MINIMAL_BRAND_XML = `<?xml version="1.0" encoding="UTF-8"?>
<brand name="test" version="1.0">
  <meta>
    <description>Test brand</description>
    <target>web</target>
  </meta>
  <colors>
    <palette name="primary" value="#dcde8d" description="Primary color"/>
    <semantic name="background" light="#ffffff" dark="#1a1a1a"/>
  </colors>
  <typography>
    <font role="sans" family="Inter" fallback="system-ui, sans-serif"/>
    <scale name="base" size="14px" line-height="1.5"/>
  </typography>
  <spacing unit="0.25rem"/>
  <radius>
    <size name="md" value="0.375rem"/>
  </radius>
</brand>`;

describe("parseBrandXml", () => {
  it("should parse minimal brand XML", () => {
    const brand = parseBrandXml(MINIMAL_BRAND_XML);

    expect(brand.name).toBe("test");
    expect(brand.version).toBe("1.0");
    expect(brand.meta.description).toBe("Test brand");
    expect(brand.meta.target).toBe("web");
  });

  it("should parse colors section", () => {
    const brand = parseBrandXml(MINIMAL_BRAND_XML);

    expect(brand.colors.palette).toHaveLength(1);
    expect(brand.colors.palette[0].name).toBe("primary");
    expect(brand.colors.palette[0].value).toBe("#dcde8d");
    expect(brand.colors.palette[0].description).toBe("Primary color");

    expect(brand.colors.semantic).toHaveLength(1);
    expect(brand.colors.semantic[0].name).toBe("background");
    expect(brand.colors.semantic[0].light).toBe("#ffffff");
    expect(brand.colors.semantic[0].dark).toBe("#1a1a1a");
  });

  it("should parse typography section", () => {
    const brand = parseBrandXml(MINIMAL_BRAND_XML);

    expect(brand.typography.fonts).toHaveLength(1);
    expect(brand.typography.fonts[0].role).toBe("sans");
    expect(brand.typography.fonts[0].family).toBe("Inter");

    expect(brand.typography.scale).toHaveLength(1);
    expect(brand.typography.scale[0].name).toBe("base");
    expect(brand.typography.scale[0].size).toBe("14px");
  });

  it("should parse spacing and radius", () => {
    const brand = parseBrandXml(MINIMAL_BRAND_XML);

    expect(brand.spacing.unit).toBe("0.25rem");
    expect(brand.radius.sizes).toHaveLength(1);
    expect(brand.radius.sizes[0].name).toBe("md");
  });

  it("should throw on invalid XML with helpful error message including input preview", () => {
    expect(() => parseBrandXml("not xml")).toThrow(/not xml/);
  });

  it("should include truncated preview for long invalid input", () => {
    const longInvalidInput = "x".repeat(100);
    expect(() => parseBrandXml(longInvalidInput)).toThrow(/x{50}/);
  });

  it("should throw on missing required sections", () => {
    const invalidXml = `<brand name="test" version="1.0"><meta><description>Test</description><target>web</target></meta></brand>`;
    expect(() => parseBrandXml(invalidXml)).toThrow(/colors/i);
  });

  it("should throw when brand element is missing name attribute", () => {
    const xmlWithoutName = `<?xml version="1.0" encoding="UTF-8"?>
<brand version="1.0">
  <meta>
    <description>Test brand</description>
    <target>web</target>
  </meta>
  <colors>
    <palette name="primary" value="#dcde8d" description="Primary color"/>
    <semantic name="background" light="#ffffff" dark="#1a1a1a"/>
  </colors>
  <typography>
    <font role="sans" family="Inter" fallback="system-ui, sans-serif"/>
    <scale name="base" size="14px" line-height="1.5"/>
  </typography>
  <spacing unit="0.25rem"/>
  <radius>
    <size name="md" value="0.375rem"/>
  </radius>
</brand>`;
    expect(() => parseBrandXml(xmlWithoutName)).toThrow(/name.*attribute.*required/i);
  });

  it("should throw when brand element is missing version attribute", () => {
    const xmlWithoutVersion = `<?xml version="1.0" encoding="UTF-8"?>
<brand name="test">
  <meta>
    <description>Test brand</description>
    <target>web</target>
  </meta>
  <colors>
    <palette name="primary" value="#dcde8d" description="Primary color"/>
    <semantic name="background" light="#ffffff" dark="#1a1a1a"/>
  </colors>
  <typography>
    <font role="sans" family="Inter" fallback="system-ui, sans-serif"/>
    <scale name="base" size="14px" line-height="1.5"/>
  </typography>
  <spacing unit="0.25rem"/>
  <radius>
    <size name="md" value="0.375rem"/>
  </radius>
</brand>`;
    expect(() => parseBrandXml(xmlWithoutVersion)).toThrow(/version.*attribute.*required/i);
  });

  it("should throw for invalid target value", () => {
    const xmlWithInvalidTarget = `<?xml version="1.0" encoding="UTF-8"?>
<brand name="test" version="1.0">
  <meta>
    <description>Test brand</description>
    <target>desktop</target>
  </meta>
  <colors>
    <palette name="primary" value="#dcde8d" description="Primary color"/>
    <semantic name="background" light="#ffffff" dark="#1a1a1a"/>
  </colors>
  <typography>
    <font role="sans" family="Inter" fallback="system-ui, sans-serif"/>
    <scale name="base" size="14px" line-height="1.5"/>
  </typography>
  <spacing unit="0.25rem"/>
  <radius>
    <size name="md" value="0.375rem"/>
  </radius>
</brand>`;
    expect(() => parseBrandXml(xmlWithInvalidTarget)).toThrow(/invalid target.*desktop.*web.*mobile.*all/i);
  });
});
