import styled from '@emotion/styled';
import Typography from '../../atoms/Typography';
import FlexSpacer from '../../atoms/FlexSpacer';

import { Checkbox, Stack, Theme } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { IParamsNFTs } from '../../../pages/StorePage';

interface StyledTreeViewProps {
    open?: boolean;
    theme?: Theme;
}

interface TreeViewProps extends StyledTreeViewProps {
    nodes?: any[];
    loading: boolean;
    selectedFilters: number[];
    setSelectedFilters: Function;
    collapsed: boolean;
    callNFTsEndpoint: (input: IParamsNFTs) => void;
}
const StyledDiv = styled.div<StyledTreeViewProps>`
    padding-left: 1.5rem;
    width: ${(props) => (props.open ? 'auto' : '0')};
    transition: width 0.2s;
    min-height: 1.5rem;

    @media (min-width: 900px) {
        min-height: 3rem;
    }
`

const StyledLi = styled.li<StyledTreeViewProps>`
    cursor: pointer;
    display: ${(props) => (props.open ? 'flex' : 'none')};
    transition: width 0.2s;
    align-items: center;
    transition: width 0.2s, height 0.2s;
    min-height: 1.5rem;

    @media (min-width: 900px) {
        min-height: 3rem;
    }
`

const StyledCheckBox = styled(Checkbox)<{ theme?: Theme }>`
    @media (max-width: 900px) {
        padding: .5rem;

        &:lastchild {
            padding: .5rem;
        }
    }
    
    &.Mui-checked {
        color: ${(props) => props.theme.palette.text.primary} !important;
    }
`


interface recurseRes {
    selectLeafs: number[];

    highlightParents: number[][];
}

const TreeView: FC<TreeViewProps> = ({
    selectedFilters = [],
    callNFTsEndpoint,
    setSelectedFilters,
    ...props
}) => {
    const [newCategorySelected, setNewCategorySelected] =
        useState<boolean>(false);
    const [highlightedParentsState, setHighlightedParents] = useState<number[]>(
        [],
    );

    const recurseChildrens = (node: any): recurseRes => {
        if (node.children?.length > 0) {
            let res: recurseRes = {
                selectLeafs: [],
                highlightParents: [],
            };
            for (const child of node.children) {
                const childRes = recurseChildrens(child);
                res.selectLeafs = [...res.selectLeafs, ...childRes.selectLeafs];
                res.highlightParents = [
                    ...res.highlightParents,
                    ...childRes.highlightParents,
                ];
            }
            res.highlightParents.push([node.id, res.selectLeafs.length]);
            return res;
        } else {
            return {
                selectLeafs: [node.id],
                highlightParents: [],
            };
        }
    };

    const select = (node: any) => {
        const recRes = recurseChildrens(node);

        let childParents: any[] = [];
        let highlightedParents: any[] = [];

        for (const [childParent, highlightCount] of recRes.highlightParents) {
            childParents.push(childParent);
            highlightedParents = [
                ...highlightedParents,
                ...Array(highlightCount).fill(childParent),
            ];
        }

        let selectedNodes = [...recRes.selectLeafs, ...childParents];
        let incrAboveHighlightCount = recRes.selectLeafs.length;

        if (selectedFilters.indexOf(node.id) === -1) {
            incrAboveHighlightCount -= [...selectedFilters].filter(
                (id) => id != node.id && recRes.selectLeafs.indexOf(id) !== -1,
            ).length;
        }

        for (const parent of getParents(node)) {
            if (selectedFilters.indexOf(node.id) > -1) {
                selectedNodes.push(parent);
            }
            highlightedParents = [
                ...highlightedParents,
                ...Array(incrAboveHighlightCount).fill(parent),
            ];
        }

        if (selectedFilters.indexOf(node.id) > -1) {
            setSelectedFilters(
                selectedFilters.filter(
                    (filterId) => selectedNodes.indexOf(filterId) === -1,
                ),
            );
            setHighlightedParents(
                listDifference(highlightedParentsState, highlightedParents),
            );
        } else {
            setSelectedFilters([
                ...selectedFilters.filter(
                    (id) => selectedNodes.indexOf(id) === -1,
                ),
                ...selectedNodes,
            ]);
            setHighlightedParents([
                ...highlightedParentsState.filter(
                    (id) => childParents.indexOf(id) === -1,
                ),
                ...highlightedParents,
            ]);
        }
        setNewCategorySelected(true);
    };

    const listDifference = (dadList: any[], babyList: any[]): any[] => {
        const dadListCopy = [...dadList];
        babyList.forEach((parent) => {
            const index = dadListCopy.indexOf(parent);

            if (index > -1) {
                dadListCopy.splice(index, 1);
            }
        });

        return dadListCopy;
    };

    // Add recursively all the parents to an array and return the array
    const getParents = (node: any, parents: any[] = []) => {
        if (node.parent) {
            parents.push(node.parent.id);
            getParents(node.parent, parents);
        }
        return parents;
    };

    // Open or close childrens
    const handleListItemClick = (concernedRef: any) => {
        if (activeRef.indexOf(concernedRef) !== -1) {
            setActiveRef(activeRef.filter((ref) => ref !== concernedRef));
        } else {
            setActiveRef([...activeRef, concernedRef]);
        }
    };

    useEffect(() => {
        if (selectedFilters.length === 0) {
            setHighlightedParents([]);
        }
        if (newCategorySelected) {
            callNFTsEndpoint({ handlePriceRange: true });
            setNewCategorySelected(false);
        }
    }, [selectedFilters]);

    useEffect(() => {
        if (selectedFilters) {
            setActiveRef([...selectedFilters]);
        }
    }, []);

    const [activeRef, setActiveRef] = useState<any[]>([]);

    const renderTree: any = (parentNode: any, children: any) => {
        return children?.map((node: any) => {
            node.parent = parentNode;

            return (
                <StyledDiv
                    open={props.open}
                    style={{
                        paddingLeft: node.parent.id === 'root' ? '0' : '',
                    }}
                >
                    <StyledLi open={props.open} key={node.id}>
                        <Stack
                            direction="row"
                            sx={{ alignItems: 'center', width: '100%' }}
                        >
                            <StyledCheckBox
                                checked={
                                    selectedFilters.indexOf(node.id) !== -1
                                }
                                onClick={() => select(node)}
                                inputProps={{ 'aria-label': 'controlled' }}
                                disableRipple
                            />

                            <Stack
                                direction="row"
                                onClick={() => handleListItemClick(node.id)}
                                sx={{ width: '100%' }}
                            >
                                <Typography
                                    size="h5"
                                    weight="Light"
                                    color={
                                        highlightedParentsState.indexOf(
                                            node.id,
                                        ) !== -1 &&
                                        selectedFilters.indexOf(node.id) === -1
                                            ? 'contrastText'
                                            : ''
                                    }
                                >
                                    {node.name}
                                </Typography>

                                <FlexSpacer />

                                {node.children?.length &&
                                node.children?.length > 0 ? (
                                    activeRef.indexOf(node.id) !== -1 ? (
                                        <Typography size="h5" weight="Light">
                                            -
                                        </Typography>
                                    ) : (
                                        <Typography size="h5" weight="Light">
                                            +
                                        </Typography>
                                    )
                                ) : undefined}
                            </Stack>
                        </Stack>
                    </StyledLi>
                    {activeRef.indexOf(node.id) !== -1
                        ? renderTree(node, node.children)
                        : undefined}
                </StyledDiv>
            );
        });
    };

    return props.nodes && !props.collapsed ? (
        renderTree(props.nodes[0], props.nodes[0].children)
    ) : (
        <></>
    );
};

export default TreeView;
