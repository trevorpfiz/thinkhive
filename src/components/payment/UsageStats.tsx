import { api } from '@/utils/api';
import { Card, Text, Metric, Flex, ProgressBar } from '@tremor/react';
import LoadingBars from '../ui/LoadingBars';

export default function UsageStats() {
  const { isLoading, data: stats, error } = api.user.getUsageStats.useQuery();

  if (isLoading) {
    return <LoadingBars />;
  }

  if (error) {
    return <Text>Something went wrong</Text>;
  }

  return (
    <div>
      {isLoading ? (
        <LoadingBars />
      ) : (
        <>
          <h3 className="text-base font-semibold leading-6 text-gray-900">Last 30 days</h3>
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {stats &&
              stats.map((item, index) => (
                <Card key={index} className="mx-auto max-w-xs bg-gray-100 shadow-none">
                  <Text>{item.name}</Text>
                  {item.name === 'Plan Credits' ? ( // conditionally render progress bar for "Credits"
                    <div>
                      <Metric>{item.stat}</Metric>
                      <Flex className="mt-4 flex-col">
                        <Flex className="mt-4 gap-4">
                          <Text>
                            {Math.round((1 - item.stat / (item.limit as number)) * 100)}% of monthly
                            limit
                          </Text>
                          <Text>{item.limit}</Text>
                        </Flex>
                        <ProgressBar
                          percentageValue={Math.round(
                            (1 - item.stat / (item.limit as number)) * 100
                          )}
                          className="mt-2"
                        />
                      </Flex>
                    </div>
                  ) : (
                    // render for any other stat
                    <>
                      <Metric>{item.stat}</Metric>
                      <Flex className="mt-4 flex-col">
                        <Flex className="mt-4 gap-4">
                          <Text>
                            {Math.round((item.stat / (item.totalUsed as number)) * 100)}% of total
                            credits used
                          </Text>
                          <Text>{item.totalUsed}</Text>
                        </Flex>
                        <ProgressBar
                          percentageValue={Math.round(
                            (item.stat / (item.totalUsed as number)) * 100
                          )}
                          className="mt-2"
                        />
                      </Flex>
                    </>
                  )}
                </Card>
              ))}
          </dl>
        </>
      )}
    </div>
  );
}
