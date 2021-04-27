import CollectionShare from 'components/CollectionShare';
import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
    Collection,
    CollectionType,
    deleteCollection,
    renameCollection,
} from 'services/collectionService';
import styled from 'styled-components';
import { SetDialogMessage } from 'utils/billingUtil';
import constants from 'utils/strings/constants';
import { CollectionNamerAttributes } from '..';

type SetCollectionNamerAttributes = React.Dispatch<
    React.SetStateAction<CollectionNamerAttributes>
>;

interface CollectionProps {
    collections: Collection[];
    selected?: number;
    selectCollection: (id?: number) => void;
    setDialogMessage: SetDialogMessage;
    syncWithRemote: () => Promise<void>;
    setCollectionNamerAttributes: SetCollectionNamerAttributes;
}

const Container = styled.div`
    margin: 0 auto;
    display: flex;
    max-width: 100%;

    @media (min-width: 1000px) {
        width: 1000px;
    }

    @media (min-width: 450px) and (max-width: 1000px) {
        width: 600px;
    }

    @media (max-width: 450px) {
        width: 100%;
    }
`;

const Wrapper = styled.div`
    margin-top: 10px;
    white-space: nowrap;
    max-width: 100%;
`;
const Option = styled.div`
    display: inline-block;
    opacity: 0;
    font-weight: bold;
    width: 0px;
    margin: 0 9px;
`;
const Chip = styled.button<{ active: boolean }>`
    border-radius: 8px;
    padding: 4px 14px;
    margin: 2px 8px 2px 2px;
    border: none;
    background-color: ${(props) =>
        props.active ? '#fff' : 'rgba(255, 255, 255, 0.3)'};
    outline: none !important;

    &:hover ${Option} {
        opacity: 1;
        color: ${(props) => (props.active ? 'black' : 'white')};
    }
`;

export default function Collections(props: CollectionProps) {
    const { selected, collections, selectCollection } = props;
    const [selectedCollectionID, setSelectedCollectionID] = useState<number>(
        null
    );
    const [renameCollectionModalView, setRenameCollectionModalView] = useState(
        false
    );
    const [collectionShareModalView, setCollectionShareModalView] = useState(
        false
    );
    const clickHandler = (collection?: Collection) => () => {
        setSelectedCollectionID(collection.id);
        selectCollection(collection?.id);
    };

    const getSelectedCollection = (collectionID: number) => {
        return collections.find((collection) => collection.id == collectionID);
    };
    if (!collections || collections.length === 0) {
        return <Container />;
    }
    const CustomToggle = React.forwardRef<any, { onClick }>(
        ({ children, onClick }, ref) => (
            <Option
                ref={ref}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClick(e);
                }}
            >
                {children}
                &#8942;
            </Option>
        )
    );
    const collectionRename = async (selectedCollection, albumName) => {
        await renameCollection(selectedCollection, albumName);
        props.syncWithRemote();
    };
    const setupRenameCollectionModal = () => {
        props.setCollectionNamerAttributes({
            title: constants.RENAME_COLLECTION,
            buttonText: constants.RENAME,
            autoFilledName: getSelectedCollection(selectedCollectionID)?.name,
            callback: collectionRename.bind(
                null,
                getSelectedCollection(selectedCollectionID)
            ),
        });
    };

    return (
        <>
            <CollectionShare
                show={collectionShareModalView}
                onHide={() => setCollectionShareModalView(false)}
                collection={getSelectedCollection(selectedCollectionID)}
                syncWithRemote={props.syncWithRemote}
            />
            <Container>
                <Wrapper>
                    <Chip active={!selected} onClick={clickHandler()}>
                        All
                    </Chip>
                    {collections?.map((item, index) => (
                        <Chip
                            key={item.id}
                            active={selected === item.id}
                            onClick={clickHandler(item)}
                        >
                            <Dropdown>
                                {item.name}
                                {item.type != CollectionType.favorites && (
                                    <>
                                        <Dropdown.Toggle
                                            as={CustomToggle}
                                            split
                                        />
                                        <Dropdown.Menu
                                            style={{
                                                minWidth: '2em',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                boxShadow:
                                                    'rgba(252, 0, 0, 0.6) 0px 1px 2px 0px, rgba(255, 0, 0, 0.3) 0px 2px 6px 2px',
                                            }}
                                        >
                                            <Dropdown.Item
                                                onClick={
                                                    setupRenameCollectionModal
                                                }
                                            >
                                                {constants.RENAME}
                                            </Dropdown.Item>
                                            <Dropdown.Divider
                                                style={{ margin: '2px' }}
                                            />
                                            <Dropdown.Item
                                                onClick={() => {
                                                    setCollectionShareModalView(
                                                        true
                                                    );
                                                }}
                                            >
                                                {constants.SHARE}
                                            </Dropdown.Item>
                                            <Dropdown.Divider
                                                style={{ margin: '2px' }}
                                            />
                                            <Dropdown.Item
                                                style={{ color: '#c93f3f' }}
                                                onClick={() => {
                                                    props.setDialogMessage({
                                                        title:
                                                            constants.CONFIRM_DELETE_COLLECTION,
                                                        content: constants.DELETE_COLLECTION_MESSAGE(),
                                                        staticBackdrop: true,
                                                        proceed: {
                                                            text:
                                                                constants.DELETE_COLLECTION,
                                                            action: deleteCollection.bind(
                                                                null,
                                                                item.id,
                                                                props.syncWithRemote
                                                            ),
                                                            variant: 'danger',
                                                        },
                                                        close: {
                                                            text:
                                                                constants.CANCEL,
                                                        },
                                                    });
                                                }}
                                            >
                                                {constants.DELETE}
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </>
                                )}
                            </Dropdown>
                        </Chip>
                    ))}
                </Wrapper>
            </Container>
        </>
    );
}
