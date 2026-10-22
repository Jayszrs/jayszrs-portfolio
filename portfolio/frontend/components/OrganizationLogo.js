"use client";

import { useId } from 'react';
import SafeImage from '@/frontend/components/SafeImage';
import { mediaSource } from '@/frontend/lib/media';
import { resolveLogoAppearance } from '@/frontend/lib/logo-appearance.cjs';

/** For logos only; source files and original-color previews stay untouched. */
export default function OrganizationLogo({ src, appearance = 'auto', className = '', imgClassName = '', style, ...props }) {
  const resolved = resolveLogoAppearance(mediaSource(src), appearance);
  const id = `organization-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const keyed = resolved === 'remove-white' || resolved === 'remove-black';
  const selective = resolved === 'lighten-dark';
  const filter = resolved === 'white' ? 'brightness(0) invert(1)' : keyed || selective ? `url(#${id})` : undefined;

  return <span className={`relative block ${className}`} data-organization-logo="" data-logo-appearance={resolved}>
    {(keyed || selective) && <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute"><defs>
      <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        {selective ? <>
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -.7087 -2.384 -.2407 0 1" />
          <feComponentTransfer result="lightInk"><feFuncA type="table" tableValues="0 0 1" /></feComponentTransfer>
          <feComposite in="lightInk" in2="SourceGraphic" operator="atop" />
        </> : <>
          <feColorMatrix type="matrix" values={resolved === 'remove-white'
            ? '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -.2126 -.7152 -.0722 0 1'
            : '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  .2126 .7152 .0722 0 0'} />
          <feComponentTransfer><feFuncA type="linear" slope="3" /></feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" />
        </>}
      </filter>
    </defs></svg>}
    <SafeImage {...props} src={src} className="h-full w-full" imgClassName={`h-full w-full object-contain ${imgClassName}`} style={{ ...style, ...(filter ? { filter } : {}) }} />
  </span>;
}
