type Props = {
	title: string;
	class?: string;
	children: unknown | Array<unknown>;
};

export function Root({ title, class: className = "", children }: Props) {
	return (
		<html lang="en" class="font-sans">
			<head>
				<meta charset="utf-8" />
				<title>{`${title} - oliverjam.es`}</title>
				<link rel="icon" href="/public/favicon.svg" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
				<link href={fonts} rel="stylesheet" />
				<link rel="stylesheet" href="/public/app.css" />
				<meta name="color-scheme" content="light dark" />
			</head>
			<body>
				<a
					class="absolute block bg-white p-2 [&:not(:focus)]:sr-only"
					href="#main"
				>
					Skip to content
				</a>
				<main id="main" tabindex="-1" class={className}>
					{children}
				</main>
			</body>
		</html>
	);
}

let fonts =
	"https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,700;1,400&display=swap";
