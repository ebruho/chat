import React from "react";
import ItemList from "@/components/shared/item-list/itemList";
import ConversationFallback from "@/components/shared/conversation/ConversationFallback";

type Props = {};

const FriendsPage = (props: Props) => {
  return (
    <>
      <ItemList title="Friends">Friends Page</ItemList>
      <ConversationFallback />

    </>
  );
};

export default FriendsPage;