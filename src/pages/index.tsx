import React from 'react';
import type { GetServerSidePropsContext } from 'next/types';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.css';
import { getResponse } from '@/utils/getResponse';

const inter = Inter({ subsets: ['latin'] });

interface ServerSideResponse {
  response: string;
}

export const getServerSideProps = async ({
  res,
  query,
}: GetServerSidePropsContext): Promise<{ props: ServerSideResponse }> => {
  let { url } = query;
  console.log('THE URL is', url);
  if (url) {
    if (Array.isArray(url)) {
      url = url[0];
    }
    const response = await getResponse(
      decodeURIComponent(url),
      query.timeout ? Number(query.timeout) : 150,
      query,
    );
    res.statusCode = response?.status ?? 404;
    return {
      props: { response: JSON.stringify(response) },
    };
  } else {
    res.statusCode = 500;
    return {
      props: { response: 'ERROR, EMPTY URL!' },
    };
  }
};

export default function Home(props: { response: string }) {
  console.log(props);
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div>{JSON.stringify(props)}</div>
      </main>
    </>
  );
}
