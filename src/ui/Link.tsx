import { ComponentProps, ForwardedRef, forwardRef } from 'react'
import { VariantProps, tv } from 'tailwind-variants'
import { createElement } from 'react'
import { PolymorphicProps } from '@src/utils/types'

const linkStyles = tv({
  base: 'cursor-pointer hover:underline focus-visible:underline',
  variants: {
    variant: {
      default: 'text-otog',
      hidden: 'hover:text-otog',
      nav: 'text-gray-500 dark:text-gray-400 hover:text-gray-800 hover:dark:text-white active:text-gray-800 dark:active:text-white transition-colors',
      close:
        'text-gray-300 dark:text-alpha-white-400 hover:text-otog hover:dark:text-otog',
      head: 'hover:text-gray-900 hover:dark:text-gray-100 hover:no-underline transition-colors',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type LinkProps = ComponentProps<'a'> &
  VariantProps<typeof linkStyles> & {
    isExternal?: boolean
    isActive?: boolean
  }

export type PolymorphLinkProps<T extends React.ElementType> = PolymorphicProps<
  LinkProps,
  T
>

export const Link = forwardRef(
  <T extends React.ElementType>(
    {
      as,
      className,
      children,
      href,
      variant,
      isActive = false,
      isExternal = false,
      ...props
    }: PolymorphLinkProps<T>,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    return createElement(
      as ?? 'a',
      {
        className: linkStyles({ variant, className }),
        href,
        target: isExternal ? '_blank' : undefined,
        rel: isExternal ? 'noopener' : undefined,
        'data-active': isActive,
        ref,
        ...props,
      },
      children
    )
  }
)
