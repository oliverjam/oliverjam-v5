type Props = { title: string; children: string | Array<string> };

export function Root({ title, children }: Props) {
	return (
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<title>{`${title} | oliverjam.es`}</title>
				<link rel="icon" href="public/favicon.svg" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
				<link href={fonts} rel="stylesheet" />
				<link rel="stylesheet" href="/public/app.css" />
			</head>
			<body>
				<a class="skip" href="#main">
					Skip to content
				</a>
				<main>{children}</main>
			</body>
		</html>
	);
}

let fonts =
	"https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,700;1,400&display=swap";
