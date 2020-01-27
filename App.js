import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  FlatList
} from "react-native";
import { AppLoading } from "expo";
import Constants from "expo-constants";

export default class App extends Component {
  // This is the access_token for our demo instagram account
  // To generate your own, each user needs to authorize your app to
  // access their account.
  //access_token = "6626870867.cbba754.83fa37c865314df8be5c52347e3e4987";
  access_token = "18973642.1677ed0.4afd9743af5545219d07f80c56ea9c71";
  // access_token2 = '638509013.cbba754.fd61c28f8fd44c3787620c4f35376325'
  user_id = "18973642";

  state = {
    loaded: false,
    data: null,
    comments: []
  };

  componentDidMount() {
    this.fetchFeed();
  }

  async fetchFeed() {
    let response = await fetch(
      "https://api.instagram.com/v1/users/" +
        this.user_id +
        "/media/recent/?access_token=" +
        this.access_token
    );
    let posts = await response.json();
    let comments = await this.makeCommentsList(posts.data);

    this.setState({
      data: posts.data,
      comments: comments,
      loaded: true
    });
  }

  createPost(postInfo, index) {
    let imageUri = postInfo.images.standard_resolution.url;
    let username = postInfo.user.username;
    let numLikes = postInfo.likes.count;

    return (
      <View>
        <Image style={styles.image} source={{ uri: imageUri }} />
        <View style={styles.info}>
          <Text style={styles.infoText}>{username}</Text>
          <Text style={styles.infoText}>
            {numLikes + (numLikes !== 1 ? " likes" : " like")}
          </Text>
        </View>
        <View>{this.state.comments[index]}</View>
      </View>
    );
  }

  async makeCommentsList(posts) {
    let postsArray = posts.map(async post => {
      let postId = post.id;

      if (post.comments.count === 0) {
        return (
          <View style={styles.comment} key={postId}>
            <Text>No Comments!</Text>
          </View>
        );
      } else {
        let response = await fetch(
          "https://api.instagram.com/v1/media/" +
            postId +
            "/comments?access_token=" +
            this.access_token
        );
        let comments = await response.json();
        let commentsArray = comments.data;
        // console.log(commentsArray)
        let commentsList = commentsArray.map(commentInfo => {
          return (
            <View style={styles.comment} key={commentInfo.id}>
              <Text style={styles.commentText}>
                {commentInfo.from.username}
              </Text>
              <Text>{commentInfo.text}</Text>
            </View>
          );
        });
        return commentsList;
      }
    });

    postsArray = await Promise.all(postsArray);
    return postsArray;
  }

  render() {
    if (!this.state.loaded) {
      return <AppLoading />;
    }
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.data}
          renderItem={({ item, index }) => this.createPost(item, index)}
          keyExtractor={item => item.id}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1"
  },
  image: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").width
  },
  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
    borderBottomWidth: 1,
    borderColor: "#d8d8d8"
  },
  infoText: {
    fontSize: 16,
    fontWeight: "bold"
  },
  comment: {
    flexDirection: "row",
    padding: 10,
    paddingLeft: 15,
    borderBottomWidth: 1,
    borderColor: "#d8d8d8"
  },
  commentText: {
    paddingRight: 15,
    fontWeight: "bold"
  }
});
