'use client';
export default function ErrorPage({reset}){return <main className="section-wrap"><h1>Portfolio temporarily unavailable</h1><p>Please try again shortly. Your saved projects are safe.</p><button className="solid-button" onClick={reset}>Try again</button><p><a href="/">Return home</a></p></main>;}
