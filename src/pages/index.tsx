import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { AxiosResponse } from 'axios';
import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface GetImagesResponse {
  after: string;
  data: {
    title: string;
    id: string;
    description: string;
    url: string;
    ts: number;
  }[];
}

export default function Home(): JSX.Element {
  const getImages = ({
    pageParam = null,
  }: {
    pageParam?: string;
  }): Promise<AxiosResponse<GetImagesResponse>> => {
    return api.get('/api/images', {
      params: {
        after: pageParam,
      },
    });
  };

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', getImages, {
    getNextPageParam: lastPage => lastPage.data.after,
  });

  const formattedData = useMemo(() => {
    const array = [];
    if (data !== undefined) {
      data.pages.forEach(page => {
        page.data.data.forEach(item => {
          array.push(item);
        });
      });
    }
    return array;
  }, [data]);

  // TODO RENDER LOADING SCREEN
  if (isLoading) {
    return <Loading />;
  }

  // TODO RENDER ERROR SCREEN
  if (isError) {
    return <Error />;
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />

        {/* TODO RENDER LOAD MORE BUTTON IF DATA HAS NEXT PAGE */}
        {hasNextPage ? (
          <Button
            disabled={isFetchingNextPage}
            onClick={() => {
              fetchNextPage({
                pageParam: data?.pages[data?.pages.length - 1].data.after,
              });
            }}
          >
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
          </Button>
        ) : (
          <></>
        )}
      </Box>
    </>
  );
}
