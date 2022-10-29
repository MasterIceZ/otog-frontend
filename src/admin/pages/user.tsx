import { GetServerSideProps } from 'next'
import Head from 'next/head'
import NextLink from 'next/link'
import { parseCookies } from 'nookies'
import { useForm } from 'react-hook-form'
import { FaPencilAlt, FaPlusCircle, FaTools } from 'react-icons/fa'
import { mutate } from 'swr'

import { Button, IconButton } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { useDisclosure } from '@chakra-ui/hooks'
import { Input } from '@chakra-ui/input'
import { Box, Flex, Link, Stack } from '@chakra-ui/layout'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal'
import { HStack, Select, UseDisclosureReturn } from '@chakra-ui/react'
import { Spinner } from '@chakra-ui/spinner'
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'

import { editUser } from '@src/admin/queries/user'
import { RenderLater } from '@src/components/RenderLater'
import { PageContainer } from '@src/components/layout/PageContainer'
import { Title, TitleLayout } from '@src/components/layout/Title'
import { getUserData } from '@src/context/AuthContext'
import { getServerSideCookies } from '@src/context/HttpClient'
import { useMutation } from '@src/hooks/useMutation'
import { registerUser } from '@src/user/queries'
import { useUsers } from '@src/user/queries'
import { CreateUser, EditUser, User } from '@src/user/types'

export default function AdminProblemPage() {
  return (
    <PageContainer maxSize="md">
      <Head>
        <title>Admin User | OTOG</title>
      </Head>
      <TitleLayout>
        <Title icon={FaTools}>ระบบ GOTO</Title>
        <HStack>
          <NextLink href="/admin/contest" passHref>
            <Button as="a">แข่งขัน</Button>
          </NextLink>
          <NextLink href="/admin/problem" passHref>
            <Button as="a">โจทย์</Button>
          </NextLink>
          <NextLink href="/admin/user" passHref>
            <Button as="a">ผู้ใช้งาน</Button>
          </NextLink>
        </HStack>
      </TitleLayout>

      <Stack spacing={4}>
        <Flex justify="flex-end">
          <CreateUserModalButton />
        </Flex>
        <UserAdminTable />
      </Stack>
    </PageContainer>
  )
}

const CreateUserModalButton = () => {
  const createModal = useDisclosure()

  const { register, reset, handleSubmit } = useForm()
  // TODO: form type
  const createUserMutation = useMutation(registerUser)
  const onSubmit = async (value: CreateUser) => {
    try {
      await createUserMutation(value)
      mutate('user')
      createModal.onClose()
      reset()
    } catch {}
  }

  return (
    <>
      <Button
        colorScheme="green"
        leftIcon={<FaPlusCircle />}
        onClick={createModal.onOpen}
      >
        เพิ่มผู้ใช้งาน
      </Button>
      <Modal {...createModal} size="sm">
        <ModalOverlay />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <ModalHeader>เพิ่มผู้ใช้งาน</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack>
                <FormControl>
                  <FormLabel>ชื่อผู้ใช้</FormLabel>
                  <Input
                    isRequired
                    {...register('username')}
                    placeholder="ชื่อผู้ใช้"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>รหัสผ่าน</FormLabel>
                  <Input
                    isRequired
                    {...register('password')}
                    placeholder="รหัสผ่าน"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>ชื่อที่ใช้แสดง</FormLabel>
                  <Input
                    isRequired
                    {...register('showName')}
                    placeholder="ชื่อที่ใช้แสดง"
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" type="submit">
                เพิ่ม
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

interface EditUserModalProps {
  user: User
  editModal: UseDisclosureReturn
}
const EditUserModalButton = (props: EditUserModalProps) => {
  const { user, editModal } = props
  const { register, reset, handleSubmit } = useForm<EditUser>({
    defaultValues: user,
  })
  const editUserMutation = useMutation(editUser)
  const onSubmit = async (value: EditUser) => {
    try {
      await editUserMutation(user.id, value)
      mutate('user')
      editModal.onClose()
      reset({ ...value, password: '' })
    } catch {}
  }

  return (
    <Modal {...editModal} size="sm">
      <ModalOverlay />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent>
          <ModalHeader>แก้ไขผู้ใช้งาน</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <FormControl>
                <FormLabel>ชื่อผู้ใช้</FormLabel>
                <Input
                  isRequired
                  {...register('username')}
                  placeholder="ชื่อผู้ใช้"
                />
              </FormControl>
              <FormControl>
                <FormLabel>รหัสผ่าน</FormLabel>
                <Input {...register('password')} placeholder="รหัสผ่าน" />
              </FormControl>
              <FormControl>
                <FormLabel>ชื่อที่ใช้แสดง</FormLabel>
                <Input
                  isRequired
                  {...register('showName')}
                  placeholder="ชื่อที่ใช้แสดง"
                />
              </FormControl>
              <FormControl>
                <FormLabel>สถานะ</FormLabel>
                <Select {...register('role')}>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </Select>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" type="submit">
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}
const UserAdminTable = () => {
  const { data: users } = useUsers()
  return users ? (
    <Box overflowX="auto">
      <Table>
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>ชื่อผู้ใช้</Th>
            <Th>ชื่อที่ใช้แสดง</Th>
            <Th>สถานะ</Th>
            <Th>แก้ไข</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.slice(0, 100).map((user) => (
            <UserAdminRow key={user.id} user={user} />
          ))}
          {users.slice(100).map((user, index) => (
            <RenderLater key={user.id} delay={~~(index / 100)}>
              <UserAdminRow user={user} />
            </RenderLater>
          ))}
        </Tbody>
      </Table>
    </Box>
  ) : (
    <Flex justify="center" py={16}>
      <Spinner size="xl" />
    </Flex>
  )
}

interface ProblemAdminProps {
  user: User
}

const UserAdminRow = (props: ProblemAdminProps) => {
  const { user } = props

  const editModal = useDisclosure()

  return (
    <Tr>
      <Td>{user.id}</Td>
      <Td maxW={200}>
        <NextLink href={`/profile/${user.id}`}>
          <Link variant="hidden">{user.username}</Link>
        </NextLink>
      </Td>
      <Td maxW={200}>
        <NextLink href={`/profile/${user.id}`}>
          <Link variant="hidden">{user.showName}</Link>
        </NextLink>
      </Td>
      <Td textTransform="capitalize">{user.role}</Td>
      <Td>
        <IconButton
          icon={<FaPencilAlt />}
          aria-label="config"
          colorScheme="blue"
          onClick={editModal.onOpen}
        />
        <EditUserModalButton editModal={editModal} user={user} />
      </Td>
    </Tr>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { accessToken = null } = parseCookies(context)
  const userData = getUserData(accessToken)
  if (userData?.role === 'admin') {
    return getServerSideCookies(context)
  }
  return {
    notFound: true,
  }
}