type DateProps = { children: string; class: string };

export function ReadableDate({ children, class: className }: DateProps) {
	let d = new Date(children);
	let current_year = d.getFullYear() === new Date().getFullYear();
	let readable = d.toLocaleDateString("en-GB", {
		year: current_year ? undefined : "numeric",
		month: "short",
		day: "numeric",
	});
	return (
		<time
			datetime={children.toString()}
			title={children.toString()}
			class={className}
		>
			{readable}
		</time>
	);
}

type Name = "note" | "article" | "clock";
type IconProps = { size?: number; name: Name };
const sprite = "/public/sprite.svg#";

export function Icon({ size = 16, name, ...rest }: IconProps) {
	return (
		<svg {...rest} width={size} height={size} aria-hidden="true">
			<use href={sprite + name} />
		</svg>
	);
}

type RowProps = { class?: string; children: unknown };
export function Row({ class: className, ...rest }: RowProps) {
	return <div {...rest} class={cn("flex items-center gap-1", className)} />;
}

export let cn = (...args: Array<string | undefined | false>): string =>
	args.reduce<string>((c, x) => (!!x ? c + " " + x : c), "");