type Props = {
	title: string;
	class?: string;
	children: unknown | Array<unknown>;
};

export function Root({ title, class: className = "", children }: Props) {
	return (
		<html lang="en" class="font-mono text-stone-800 bg-paper-300">
			<head>
				<title>{`${title} - oliverjam.es`}</title>
				<link rel="icon" href="/public/favicon.svg" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="stylesheet" href="/public/app.css" />
				<meta name="color-scheme" content="light dark" />
				<script type="module" src="/public/transclusion.js"></script>
			</head>
			<body>
				<a
					class="absolute block bg-white p-2 [&:not(:focus)]:sr-only"
					href="#main"
				>
					Skip to content
				</a>
				<main id="main" tabindex="-1">
					{children}
				</main>
			</body>
		</html>
	);
}

export function Page({
	children,
	class: className = "",
}: {
	children: unknown;
	class?: string;
}) {
	return <div class={"space-y-8 p-8 max-w-2xl " + className}>{children}</div>;
}
