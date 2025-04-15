import Head from "next/head";
import metadata from "../components/Tags.json";

const CommonTags = ({ title, canonical, keywords, description ,path}) => {
  return (
    <Head>
      {/ Only dynamic meta tags /}
      <title>{title || metadata.title}</title>
      <meta
        name="description"
        content={description || metadata.description}
      />
      <meta name="keywords" content={keywords || metadata.keywords} />
      <link rel="canonical" href={canonical || metadata.canonical} />
      {path && <link rel="preload" href={path} as="image" />}

      {/ {title && <meta property="og:title" content={title} />} /} 
      {/ {description && <meta property="og:description" content={description} />} /}
      {/* <meta charSet={metadata.charset} />
      <meta name="viewport" content={metadata.viewport} /> */}

      {/* <meta name="author" content={metadata.author} />
      <meta name="robots" content={metadata.robots} />
      <meta property="og:title" content={title || metadata.og.title} /> */}
      {/ <meta property="og:description" content={metadata.og.description} /> /}

      {/ <meta property="og:url" content={canonical || metadata.og.url} /> /}

      {/* <meta property="og:type" content={metadata.og.type} />
      <meta property="og:image" content={metadata.og.image} />
      <meta name="twitter:card" content={metadata.twitter.card} />
      <meta name="twitter:title" content={title || metadata.twitter.title} />
      <meta name="twitter:description" content={metadata.twitter.description} />
      <meta name="twitter:image" content={metadata.twitter.image} /> */}

      {/ <link rel="icon" href={metadata.favicon} type="image/x-icon" /> /}
      {/* <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-VCXYRHFDHM"
      ></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VCXYRHFDHM');
          `,
        }}
      /> */}
    </Head>
  );
};

export default CommonTags;
