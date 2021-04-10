import React, { useMemo } from 'react'
import {
  Table,
  TableCellProps,
  Tbody,
  Th as THead,
  Td as TData,
  Thead,
  Tr,
  TableColumnHeaderProps,
} from '@chakra-ui/table'
import { PageContainer } from '@src/components/PageContainer'
import { ButtonGroup, IconButton } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { HTMLMotionProps, motion } from 'framer-motion'
import { HTMLChakraProps, useTheme } from '@chakra-ui/system'
import { Title } from '@src/components/Title'
import { FaTrophy } from 'react-icons/fa'
import { Box, Stack } from '@chakra-ui/layout'
import { CgDetailsLess, CgDetailsMore } from 'react-icons/cg'
import {
  Contest,
  ContestScoreboard,
  UserWithSubmission,
} from '@src/utils/api/Contest'
import nookies from 'nookies'

import {
  ApiClient,
  getServerSideProps as getServerSideCookie,
} from '@src/utils/api'
import { GetServerSideProps } from 'next'
import { AxiosError } from 'axios'
import { getErrorToast } from '@src/utils/error'
import { sum } from '@src/utils'
import { Tooltip } from '@chakra-ui/tooltip'

const Th = (props: TableColumnHeaderProps) => (
  <THead textAlign="center" {...props} />
)
const Td = (props: TableCellProps) => (
  <TData textAlign="center" lineHeight={undefined} py={2} {...props} />
)

type Merge<P, T> = Omit<P, keyof T> & T
type MotionTrProps = Merge<HTMLChakraProps<'tr'>, HTMLMotionProps<'tr'>>
export const MotionTr: React.FC<MotionTrProps> = motion(Tr)

const fontSize: Record<number, string> = {
  1: '5xl',
  2: '4xl',
  3: '3xl',
  4: '2xl',
  5: 'xl',
}

export interface ContestHistoryProps {
  initialData: ContestScoreboard
}

export default function ContestHistory(props: ContestHistoryProps) {
  const { initialData: scoreboard } = props

  const getTotalScore = (user: UserWithSubmission) =>
    sum(user.submissions.map((submission) => submission.score))

  const users = useMemo(() => {
    const scored = scoreboard.users.map((user) => ({
      ...user,
      totalScore: getTotalScore(user),
    }))
    const sorted = scored.sort((a, b) => b.totalScore - a.totalScore)
    var rank = 1
    return sorted.map((user, index) => {
      if (index === 0) {
        return { ...user, rank }
      }
      if (sorted[index - 1].totalScore === sorted[index].totalScore) {
        return { ...user, rank }
      }
      return { ...user, rank: ++rank }
    })
  }, [])

  const { isOpen, onOpen, onClose } = useDisclosure()
  const theme = useTheme()

  return (
    <PageContainer>
      <Stack direction="row" justify="space-between" align="center">
        <Title icon={FaTrophy}>{scoreboard.name}</Title>
        <ButtonGroup isAttached variant="outline">
          <IconButton
            aria-label="less-detail"
            onClick={onClose}
            isActive={!isOpen}
            icon={<CgDetailsLess />}
          />
          <IconButton
            aria-label="more-detail"
            onClick={onOpen}
            isActive={isOpen}
            icon={<CgDetailsMore />}
          />
        </ButtonGroup>
      </Stack>
      <Box overflowX="auto">
        <Table variant={isOpen ? 'simple' : 'unstyled'}>
          <Thead>
            <Tr whiteSpace="nowrap">
              <Th>#</Th>
              <Th>ชื่อ</Th>
              <Th>คะแนนรวม</Th>
              {isOpen &&
                scoreboard.problems.map((problem, index) => (
                  <Th key={problem.id}>
                    <Tooltip hasArrow label={problem.name} placement="top">
                      <div>ข้อที่ {index + 1}</div>
                    </Tooltip>
                  </Th>
                ))}
              <Th>เวลาที่ใช้</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <MotionTr
                key={user.id}
                animate={isOpen ? 'small' : 'large'}
                initial="large"
                variants={{
                  small: {
                    fontSize: theme.fontSizes['md'],
                  },
                  large: {
                    fontSize: theme.fontSizes[fontSize[user.rank] ?? 'md'],
                  },
                }}
              >
                <Td>{user.rank}</Td>
                <Td isTruncated>{user.showName}</Td>
                <Td>{getTotalScore(user)}</Td>
                {isOpen &&
                  scoreboard.problems.map((problem) => {
                    const submission = user.submissions.find(
                      (submission) => submission.problemId === problem.id
                    )
                    return (
                      <Td key={`${user.id}/${problem.id}`}>
                        {submission?.score ?? 0}
                      </Td>
                    )
                  })}
                <Td>
                  {sum(
                    user.submissions.map((submission) => submission.timeUsed)
                  ) / 1000}
                </Td>
              </MotionTr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // console.log('before req', context.req.headers)
  // console.log('before res', context.res.getHeader('set-cookie'))
  const props = await getServerSideCookie(context)
  const client = new ApiClient(context)
  try {
    const initialData = await client.get<Contest | null>(
      `contest/${context.query.id}/scoreboard`
    )
    const { accessToken = null } = nookies.get(context)
    return {
      props: { initialData, accessToken, ...props },
    }
  } catch (e) {
    if (e.isAxiosError) {
      const error = e as AxiosError
      if (error.response?.status === 401) {
        const errorToast = getErrorToast(error)
        return {
          props: { accessToken: null, error: errorToast, ...props },
        }
      }

      if (error.response === undefined) {
        const errorToast = getErrorToast(error)
        return {
          props: { error: errorToast, ...props },
        }
      }
    }
    console.log(e)
  } finally {
    // console.log('after req', context.req.headers)
    // console.log('after res', context.res.getHeader('set-cookie'))
  }

  return { props }
}