import useAxios from 'axios-hooks'
import styled from '@emotion/styled'
import Tabs from '../../design-system/molecules/Tabs'
import NftGrid from '../../design-system/organismes/NftGrid'
import FlexSpacer from '../../design-system/atoms/FlexSpacer'
import PageWrapper from '../../design-system/commons/PageWrapper'

import { Pagination, Stack } from '@mui/material'
import { IUser } from '../../interfaces/user'
import { Animated } from 'react-animated-css'
import { FC, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { HeaderProfile } from '../../design-system/molecules/HeaderProfile/HeaderProfile'
import { Theme } from '@mui/material'

interface ParamTypes {
    userAddress: string
    tab?: string
}

interface ProfileProps { }

const StyledStack = styled(Stack)`
    width: 100vw;
    max-width: 100rem;
`

const StyledAnimated = styled(Animated)`
    display: 'initial';
    height: auto;

    @media (max-width: 650px) {
        padding-left: 0rem !important;
        padding-right: 0rem !important;
    }
`

const StyledDiv = styled.div`
    transition: max-height 0.5s, min-height 0.5s;

    @media (max-width: 650px) {
        padding-top: 2rem;
    }
`

const StyledPagination = styled(Pagination) <{
    theme?: Theme
    display: boolean
}>`
    display: ${(props) => (props.display ? 'flex' : 'none')};

    .MuiPaginationItem-root {
        border-radius: 0;

        font-family: 'Poppins' !important;
    }

    .MuiPaginationItem-root.Mui-selected {
        background-color: ${(props) =>
        props.theme.palette.background.default} !important;
        border: 1px solid ${(props) => props.theme.palette.text.primary} !important;
    }

    nav {
        display: flex;
        align-items: center !important;
    }
`

const Profile: FC<ProfileProps> = () => {
    let { userAddress } = useParams<ParamTypes>()

    const history = useHistory()

    // Using the useState hook in case adding more tabs in the future
    const [selectedTab, setSelectedTab] = useState('Collection')

    const [userResponse, getUser] = useAxios(
        {
            url: process.env.REACT_APP_API_SERVER_BASE_URL + `/users`,
            withCredentials: true,
        },
        { manual: true },
    )

    const [userNftsResponse, getUserNfts] = useAxios(
        {
            url: process.env.REACT_APP_API_SERVER_BASE_URL + `/nfts/filter`,
            withCredentials: true,
        },
        { manual: true },
    )

    useEffect(() => {
        if (!userAddress) {
            history.push('/404')
        }

        getUser({
            params: {
                userAddress: userAddress,
            },
        })

        getUserNfts({
            params: {
                address: userAddress,
                pageSize: 12,
            },
        })
    }, [])

    const handleSwitchTab = (newValue: number) => {
        switch (newValue) {
            // Collection
            case 1:
                setSelectedTab('Collection')
                break
            default:
                setSelectedTab('Collection')
                break
        }
    }

    useEffect(() => {
        if (userResponse.error?.code === '404') {
            history.push('/404')
        }
    }, [userResponse])

    // Edit profile section
    const editProfile = () => {
        if (userResponse.data?.user) {
            const currentUser = {
                userName: userResponse.data?.user.userName,
                profilePicture: userResponse.data?.user.profilePicture,
            }
            history.push({
                pathname: '/profile/edit',
                state: { currentUser },
            })
        }
    }

    const [selectedPage, setSelectedPage] = useState(1)

    const handlePaginationChange = (event: any, page: number) => {

        setSelectedPage(page)

        getUserNfts({
            withCredentials: true,
            params: {
                address: userAddress,
                page: page,
                pageSize: 12,
            },
        })

    }


    return (
        <PageWrapper>
            <StyledStack direction="column">
                <FlexSpacer minHeight={10} />

                <StyledDiv>
                    <StyledAnimated
                        animationIn="fadeIn"
                        animationOut="fadeOut"
                        isVisible={true}
                    >
                        <HeaderProfile
                            user={userResponse.data?.user}
                            loading={userResponse.loading}
                            editProfile={editProfile}
                            nftsCount={userResponse.data?.nftCount}
                        />

                        <FlexSpacer minHeight={2} />

                        <Tabs
                            tabs={[
                                {
                                    label: 'Collection',
                                    value: 1,
                                },
                            ]}
                            handleValueChange={handleSwitchTab}
                        />
                    </StyledAnimated>
                </StyledDiv>
                <FlexSpacer minHeight={2} />

                <NftGrid
                    open={false}
                    loading={userNftsResponse.loading}
                    nfts={userNftsResponse.data?.nfts}
                    emptyMessage={'No Nfts in collection yet'}
                    emptyLink={'Click here to buy some in the store.'}
                />

                <FlexSpacer minHeight={2} />

                <Stack direction="row">
                    <FlexSpacer />
                    <StyledPagination
                        display={userNftsResponse.data?.numberOfPages > 1}
                        page={selectedPage}
                        count={userNftsResponse.data?.numberOfPages}
                        onChange={handlePaginationChange}
                        variant="outlined"
                        shape="rounded"
                        disabled={userNftsResponse.loading || userNftsResponse.data?.numberOfPages === 1}
                    />
                </Stack>
                <FlexSpacer minHeight={2} />
            </StyledStack>
        </PageWrapper>
    )
}

export default Profile
