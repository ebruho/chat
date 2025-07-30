import React from "react";
import ItemList from "@/components/shared/item-list/itemList";
import ConversationFallback from "@/components/shared/conversation/ConversationFallback";
import AddFriendDialog from "./_components/addFriendDialog";

type Props = {};

const FriendsPage = (props: Props) => {
  return (
    <>
      <ItemList title="Friends" action={<AddFriendDialog/>}>Friends Page</ItemList>
      <ConversationFallback />

    </>
  );
};

export default FriendsPage;