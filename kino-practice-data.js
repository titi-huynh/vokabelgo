/* Reviewed practice shortlists. Keep original cue IDs and per-film progress keys.
 * Load after kino-chapter-data.js; this does not load any subtitle/media files.
 * Each usage note describes a situation, without revealing the German answer. */
const KINO_PRACTICE_DATA = {
  "courage_fischverfolgungsjagd": [
  {
    "part": 1,
    "picks": [
      {
        "id": 1800101,
        "usage": "Hỏi thăm một người bạn sau khi họ vừa gặp sự cố."
      },
      {
        "id": 1800102,
        "usage": "Đáp lại ngắn gọn và xác nhận rằng mình vẫn ổn."
      },
      {
        "id": 1800103,
        "usage": "Ra lệnh cho một nhóm người trả tự do cho những người đang bị giữ."
      }
    ]
  },
  {
    "part": 2,
    "picks": [
      {
        "id": 1800104,
        "usage": "Ra lệnh cho những người khác bắt giữ một nhân vật cụ thể trong câu chuyện."
      },
      {
        "id": 1800105,
        "usage": "Nhận xét rằng một người rõ ràng đã trở thành nạn nhân của một tình trạng."
      },
      {
        "id": 1800106,
        "usage": "Tiếp tục lời giải thích và nói rằng đối tượng cần được tác động trở lại bằng cấu trúc bị động."
      }
    ]
  }
],
  "pinguine_quietschsauber": [
  {
    "part": 1,
    "picks": [
      {
        "id": 1700101,
        "usage": "Khi nhận ra căn phòng có điều gì khác mọi ngày."
      },
      {
        "id": 1700103,
        "usage": "Khi báo rằng kết quả tính toán cho thấy cả nhóm đang có khách."
      },
      {
        "id": 1700104,
        "usage": "Khi nhắc cả nhóm khử trùng mặt bàn làm việc."
      },
      {
        "id": 1700105,
        "usage": "Khi hỏi lý do sau khi nghe nói một người đang bối rối."
      },
      {
        "id": 1700106,
        "usage": "Khi an ủi rằng chuyện như vậy vẫn thường xảy ra."
      },
      {
        "id": 1700107,
        "usage": "Khi muốn biết lý do một người xuất hiện ở đây."
      },
      {
        "id": 1700108,
        "usage": "Khi giải thích rằng có người thực sự rất bừa bộn, ở bẩn."
      }
    ]
  },
  {
    "part": 2,
    "picks": [
      {
        "id": 1700110,
        "usage": "Khi vui vì hai người cùng có một ý nghĩ."
      },
      {
        "id": 1700111,
        "usage": "Khi cho biết mình đã nghe được toàn bộ cuộc trò chuyện."
      },
      {
        "id": 1700112,
        "usage": "Khi kiểm tra xem người khác có còn nghe thấy mình không."
      },
      {
        "id": 1700113,
        "usage": "Khi trả lời rằng mình nghe rất rõ."
      },
      {
        "id": 1700114,
        "usage": "Khi ngạc nhiên và muốn xác nhận lời người kia vừa nói."
      },
      {
        "id": 1700119,
        "usage": "Khi xác nhận mình vừa nghe ai nhắc tới việc tổng vệ sinh."
      },
      {
        "id": 1700120,
        "usage": "Khi thông báo cả nhóm đã sẵn sàng cho chiến dịch dọn dẹp."
      }
    ]
  }
],
  "spongebob_blubberunterricht": [
  {
    "part": 1,
    "picks": [
      {
        "id": 1600101,
        "usage": "Nhắc người bạn đừng quên điều quan trọng khi thực hành."
      },
      {
        "id": 1600102,
        "usage": "Chỉ cho bạn từng động tác đơn giản."
      },
      {
        "id": 1600104,
        "usage": "Mời bạn nhìn cách mình làm rồi đếm từng bước."
      },
      {
        "id": 1600105,
        "usage": "Nhắc cả nhóm luôn chú ý đến cách làm."
      },
      {
        "id": 1600106,
        "usage": "Gọi tên bạn và nhắc bạn tập trung."
      },
      {
        "id": 1600107,
        "usage": "Hướng dẫn bạn tiếp đất an toàn bằng một chân cụ thể."
      },
      {
        "id": 1600108,
        "usage": "Đáp lại khi ai đó liên tục nhắc việc bạn đã nhớ."
      }
    ]
  },
  {
    "part": 2,
    "picks": [
      {
        "id": 1600109,
        "usage": "Khen một màn thể hiện vừa hoàn thành rất xuất sắc."
      },
      {
        "id": 1600111,
        "usage": "Tự đánh giá thành quả rồi hỏi người khác có đồng ý không."
      },
      {
        "id": 1600112,
        "usage": "Thừa nhận rằng nhóm mình chưa từng làm được điều tương tự."
      },
      {
        "id": 1600113,
        "usage": "Nhắc người nghe rằng mình đã nói điều đó từ trước."
      },
      {
        "id": 1600114,
        "usage": "Giải thích rằng kết quả thành công phụ thuộc vào cách làm."
      },
      {
        "id": 1600117,
        "usage": "Phủ nhận việc mình thành công nhờ sự giúp đỡ của người khác."
      },
      {
        "id": 1600118,
        "usage": "Nói đùa rằng năng khiếu của mình là bẩm sinh."
      }
    ]
  }
],
  "peppa_supermarkt": [
    {
      "part": 1,
      "picks": [
        {
          "id": 100301,
          "usage": "Khi kiểm tra những thực phẩm đã có trong giỏ hàng."
        },
        {
          "id": 100403,
          "usage": "Khi lỡ va vào hoặc làm phiền người khác và muốn xin lỗi."
        },
        {
          "id": 100502,
          "usage": "Khi nhắc khách đến quầy thanh toán trước giờ đóng cửa."
        },
        {
          "id": 100503,
          "usage": "Khi cả nhóm cần nhanh lên để kịp giờ."
        },
        {
          "id": 100902,
          "usage": "Khi muốn người đi trước chờ mình và những người còn lại."
        },
        {
          "id": 101001,
          "usage": "Khi nhắc đến món tiếp theo cần mua."
        },
        {
          "id": 101802,
          "usage": "Khi nhắc nhau giảm tốc độ vì đang chạy quá nhanh."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 102302,
          "usage": "Khi hướng dẫn người khác dùng quầy tự thanh toán."
        },
        {
          "id": 102602,
          "usage": "Khi nhờ ai đặt túi vào khu vực đóng hàng."
        },
        {
          "id": 103202,
          "usage": "Khi báo rằng máy hoặc thao tác đang không hoạt động."
        },
        {
          "id": 103402,
          "usage": "Khi thấy kết quả có vẻ sai và muốn kiểm tra lại."
        },
        {
          "id": 103403,
          "usage": "Khi giải thích rằng mình không cần mua nhiều như vậy."
        },
        {
          "id": 103701,
          "usage": "Khi chưa biết cách quét mã một món hàng và cần hỏi."
        },
        {
          "id": 104101,
          "usage": "Khi hướng dẫn ai bấm nút bên hông thiết bị."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 104802,
          "usage": "Khi gặp một thiết bị hoặc trò chơi mới và muốn hỏi cách dùng."
        },
        {
          "id": 105002,
          "usage": "Khi nghe một lời rủ rê có vẻ thú vị và muốn hưởng ứng."
        },
        {
          "id": 105304,
          "usage": "Khi muốn trấn an người đang lo lắng hoặc thất vọng."
        },
        {
          "id": 105703,
          "usage": "Khi xin phép được thử thêm một lần nữa."
        },
        {
          "id": 106002,
          "usage": "Khi nhận sửa một món đồ đang hỏng."
        },
        {
          "id": 106302,
          "usage": "Khi tặng một món nhỏ để cảm ơn người đã giúp mình."
        },
        {
          "id": 106402,
          "usage": "Khi đưa cho người đối diện món đồ dành riêng cho họ."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 106604,
          "usage": "Khi nhận ra mình chính là người đang được tìm."
        },
        {
          "id": 106901,
          "usage": "Khi mời người khác tự chọn món họ thích."
        },
        {
          "id": 107001,
          "usage": "Khi bất ngờ biết thêm sở thích của một người."
        },
        {
          "id": 107201,
          "usage": "Khi khen lựa chọn của người khác."
        },
        {
          "id": 107303,
          "usage": "Khi giới thiệu món đồ chơi mình đã chọn."
        },
        {
          "id": 108002,
          "usage": "Khi tò mò hỏi về một căn phòng chưa từng thấy."
        },
        {
          "id": 108203,
          "usage": "Khi vừa thấy một việc lạ và muốn biết chuyện gì đã xảy ra."
        }
      ]
    },
    {
      "part": 5,
      "picks": [
        {
          "id": 108701,
          "usage": "Khi muốn biết hôm nay có món gì để ăn."
        },
        {
          "id": 108803,
          "usage": "Khi hỏi cách làm món ăn vừa được nhắc đến."
        },
        {
          "id": 109002,
          "usage": "Khi nhắc nhau rửa rau sạch trước khi nấu."
        },
        {
          "id": 109402,
          "usage": "Khi thấy người thân có vẻ khó chịu và muốn hỏi thăm."
        },
        {
          "id": 109403,
          "usage": "Khi hỏi người khác có không thích hành tây hay không."
        },
        {
          "id": 109803,
          "usage": "Khi muốn nói mình rất thích một món ăn."
        },
        {
          "id": 110001,
          "usage": "Khi nhẹ nhàng đề nghị ai làm chậm lại một chút."
        }
      ]
    }
  ],
  "pizzaschwester": [
    {
      "part": 1,
      "picks": [
        {
          "id": 200203,
          "usage": "Khi nhận điện thoại ở tiệm và hỏi khách có muốn đặt pizza."
        },
        {
          "id": 200302,
          "usage": "Khi gọi món và yêu cầu bỏ nguyên liệu mình không muốn."
        },
        {
          "id": 200401,
          "usage": "Khi hỏi khách có muốn gọi thêm món ăn kèm."
        },
        {
          "id": 200502,
          "usage": "Khi trấn an khách rằng họ sẽ không phải chờ lâu."
        },
        {
          "id": 200601,
          "usage": "Khi hỏi người nhận đơn có cần địa chỉ giao hàng của mình."
        },
        {
          "id": 201001,
          "usage": "Khi báo rằng món ăn đã làm xong."
        },
        {
          "id": 201502,
          "usage": "Khi hướng dẫn khách chỉ lấy phần thức ăn."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 202502,
          "usage": "Khi nhắc người khác cẩn thận với món đồ đang dùng."
        },
        {
          "id": 203202,
          "usage": "Khi báo điện thoại đang không hoạt động."
        },
        {
          "id": 203902,
          "usage": "Khi gặp trở ngại và muốn cùng bàn cách giải quyết."
        },
        {
          "id": 204601,
          "usage": "Khi nói mình vừa có một trải nghiệm vui."
        },
        {
          "id": 204602,
          "usage": "Khi lịch sự xin đến lượt lái xe."
        },
        {
          "id": 204803,
          "usage": "Khi nhắc rằng thiết bị cần được sạc pin."
        },
        {
          "id": 205001,
          "usage": "Khi hỏi sạc pin sẽ mất bao lâu."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 205301,
          "usage": "Khi nhấn mạnh yêu cầu bỏ nấm trong đơn đặt món."
        },
        {
          "id": 205602,
          "usage": "Khi giải thích rằng xe cần được sửa gấp."
        },
        {
          "id": 205802,
          "usage": "Khi mang món ăn ra cho khách."
        },
        {
          "id": 205902,
          "usage": "Khi đưa tiền để thanh toán."
        },
        {
          "id": 206604,
          "usage": "Khi báo đã đến lượt người khác lái xe."
        },
        {
          "id": 206904,
          "usage": "Khi muốn báo mình đi một lát rồi quay lại ngay."
        },
        {
          "id": 207104,
          "usage": "Khi đề nghị sửa xe cho một người đang cần giúp."
        }
      ]
    }
  ],
  "babysitter": [
    {
      "part": 1,
      "picks": [
        {
          "id": 300201,
          "usage": "Khi chào người quen và hỏi họ có khỏe không."
        },
        {
          "id": 300303,
          "usage": "Khi đính chính rằng người khác đã nhầm giới tính của mình."
        },
        {
          "id": 300601,
          "usage": "Khi muốn giúp người đang lo lắng yên tâm hơn."
        },
        {
          "id": 301101,
          "usage": "Khi kiểm tra người kia đã nhận được tin nhắn của mình chưa."
        },
        {
          "id": 301102,
          "usage": "Khi báo rằng mình chưa nhận được tin nhắn vừa nhắc đến."
        },
        {
          "id": 301103,
          "usage": "Khi lịch sự nói mình sẽ rời đi nếu không cần nữa."
        },
        {
          "id": 301302,
          "usage": "Khi muốn đồng ý với một đề nghị và giúp người kia yên tâm."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 301602,
          "usage": "Khi giải thích rằng trải nghiệm vừa rồi khác với điều mình quen."
        },
        {
          "id": 301702,
          "usage": "Khi muốn nói mình chưa quen ai đủ nhiều để cảm thấy yên tâm."
        },
        {
          "id": 301801,
          "usage": "Khi công nhận ý kiến của người đối diện là đúng."
        },
        {
          "id": 301902,
          "usage": "Khi chưa biết luật và muốn hỏi cách chơi một trò."
        },
        {
          "id": 302201,
          "usage": "Khi trò chuyện làm quen và hỏi về bạn bè của nhau."
        },
        {
          "id": 302601,
          "usage": "Khi nói chuyện thân thiết về dự định có con trong tương lai."
        },
        {
          "id": 303002,
          "usage": "Khi rủ cả nhóm đổi sang chơi ở ngoài vườn."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 303103,
          "usage": "Khi hỏi người khác thường chơi những trò gì."
        },
        {
          "id": 303501,
          "usage": "Khi muốn đưa ra một ý tưởng để mọi người cân nhắc."
        },
        {
          "id": 303503,
          "usage": "Khi động viên người đang chưa quen với một việc mới."
        },
        {
          "id": 303705,
          "usage": "Khi đề nghị cùng nghe hoặc kể một câu chuyện."
        },
        {
          "id": 304002,
          "usage": "Khi muốn biết lý do người khác từ chối hoặc không thích điều gì."
        },
        {
          "id": 304301,
          "usage": "Khi cần nói rõ rằng mình chưa hề nhờ người kia giúp như vậy."
        },
        {
          "id": 305003,
          "usage": "Khi thấy câu chuyện còn dang dở và muốn nghe tiếp."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 305501,
          "usage": "Khi muốn người kia hứa chắc với mình."
        },
        {
          "id": 305901,
          "usage": "Khi nhắc lại một trải nghiệm trước đây không diễn ra suôn sẻ."
        },
        {
          "id": 305902,
          "usage": "Khi trấn an rằng lần này sẽ khác."
        },
        {
          "id": 306001,
          "usage": "Khi lo chuyện cũ lặp lại và muốn được giải thích để yên tâm."
        },
        {
          "id": 306101,
          "usage": "Khi động viên ai thử một việc trước khi biết kết quả."
        },
        {
          "id": 306201,
          "usage": "Khi quyết định thử làm điều mình còn ngần ngại."
        },
        {
          "id": 306401,
          "usage": "Khi thừa nhận người đối diện nói có lý."
        }
      ]
    }
  ],
  "hans": [
    {
      "part": 1,
      "picks": [
        {
          "id": 400108,
          "usage": "Khi báo khoảng thời gian mình đã thỏa thuận vừa kết thúc."
        },
        {
          "id": 400109,
          "usage": "Khi bày tỏ mong muốn trở về nhà với mẹ."
        },
        {
          "id": 400110,
          "usage": "Khi nhân vật yêu cầu chủ trả công sau thời gian làm việc; cách nói mang sắc thái cổ tích."
        },
        {
          "id": 400121,
          "usage": "Khi muốn biết vì sao người kia chọn đi bộ."
        },
        {
          "id": 400124,
          "usage": "Khi giải thích rằng vật đang mang quá nặng khiến mình khó đi tiếp."
        },
        {
          "id": 400126,
          "usage": "Khi đề nghị đổi đồ với người khác."
        },
        {
          "id": 400129,
          "usage": "Khi vui vẻ nhận lời một đề nghị."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 400139,
          "usage": "Khi nói một hoạt động không vui như mình đã tưởng."
        },
        {
          "id": 400141,
          "usage": "Khi quyết định không bao giờ thử ngồi lên vật đó nữa."
        },
        {
          "id": 400142,
          "usage": "Khi so sánh và cho rằng con bò là lựa chọn tốt hơn trong câu chuyện."
        },
        {
          "id": 400150,
          "usage": "Khi nhân vật nói muốn vắt sữa bò để giải khát."
        },
        {
          "id": 400161,
          "usage": "Khi nói mình không thích ăn thịt bò."
        },
        {
          "id": 400162,
          "usage": "Khi bày tỏ mình thích thịt lợn hơn."
        },
        {
          "id": 400165,
          "usage": "Khi đề nghị đổi con vật mình có lấy con vật của người kia."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 400171,
          "usage": "Khi muốn người khác chú ý vì mình nghi có vấn đề."
        },
        {
          "id": 400176,
          "usage": "Khi cần nhờ người khác giúp ngay."
        },
        {
          "id": 400179,
          "usage": "Khi nhận giúp dù bản thân cũng có thể gặp rủi ro."
        },
        {
          "id": 400182,
          "usage": "Khi nghĩ lại và thấy mình đã đổi được một món có lợi."
        },
        {
          "id": 400192,
          "usage": "Khi hỏi thăm người đang hát với tâm trạng vui vẻ."
        },
        {
          "id": 400195,
          "usage": "Khi tự hào nói nghề của mình rất có giá trị."
        },
        {
          "id": 400197,
          "usage": "Khi tò mò hỏi người kia có món đồ hoặc con vật đó từ đâu."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 400207,
          "usage": "Khi khen người khác luôn biết tự tìm cách giải quyết."
        },
        {
          "id": 400211,
          "usage": "Khi trấn an rằng những việc còn lại sẽ dần tự ổn thỏa."
        },
        {
          "id": 400212,
          "usage": "Khi đưa cho ai một món đồ họ đang cần."
        },
        {
          "id": 400220,
          "usage": "Khi nhắc người khác cất giữ một vật cẩn thận."
        },
        {
          "id": 400223,
          "usage": "Khi vui mừng vì mọi mong muốn của mình đều thành hiện thực."
        },
        {
          "id": 400224,
          "usage": "Khi cảm thấy mình rất may mắn."
        },
        {
          "id": 400236,
          "usage": "Khi nhân vật reo lên vì quá hạnh phúc; cách nói cường điệu trong cổ tích."
        }
      ]
    }
  ],
  "trudes_fahrstuhl": [
    {
      "part": 1,
      "picks": [
        {
          "id": 600102,
          "usage": "Khi hỏi có cần mang đồ đã mượn trả lại cho chủ."
        },
        {
          "id": 600107,
          "usage": "Khi nhờ người đi cùng cầm giúp một món đồ."
        },
        {
          "id": 600109,
          "usage": "Khi chọn đi cầu thang bộ và giải thích lý do sức khỏe."
        },
        {
          "id": 600111,
          "usage": "Khi hẹn gặp lại nhau ở tầng trên."
        },
        {
          "id": 600112,
          "usage": "Khi nhận thấy người kia gặp chuyện và muốn hỏi."
        },
        {
          "id": 600114,
          "usage": "Khi báo rằng mình đang bị kẹt, không đi tiếp được."
        },
        {
          "id": 600117,
          "usage": "Khi lịch sự gợi ý người khác đi thang máy."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 600122,
          "usage": "Khi nói mình chưa thể làm được một việc."
        },
        {
          "id": 600124,
          "usage": "Khi giải thích rằng mình sợ không gian kín."
        },
        {
          "id": 600125,
          "usage": "Khi giải thích nỗi sợ không gian hẹp cho người chưa biết."
        },
        {
          "id": 600126,
          "usage": "Khi mô tả tình huống khiến mình hoảng sợ."
        },
        {
          "id": 600130,
          "usage": "Khi ngạc nhiên hỏi lại về nỗi sợ của người đối diện."
        },
        {
          "id": 600131,
          "usage": "Khi trấn an ai rằng những con vật ấy không làm hại họ."
        },
        {
          "id": 600134,
          "usage": "Khi nhờ người khác giữ kín nỗi sợ của mình với mẹ."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 600138,
          "usage": "Khi nhẹ nhàng gợi ý người khác luyện tập một việc còn ngại."
        },
        {
          "id": 600143,
          "usage": "Khi quyết định thử dù vẫn hơi phân vân."
        },
        {
          "id": 600144,
          "usage": "Khi tự nhắc mình hoặc người khác giữ bình tĩnh."
        },
        {
          "id": 600145,
          "usage": "Khi cảm thấy cách đang thử có thể thành công."
        },
        {
          "id": 600147,
          "usage": "Khi hỏi món đồ mình đang tìm ở đâu."
        },
        {
          "id": 600148,
          "usage": "Khi chỉ chỗ mình vừa đặt một món đồ."
        },
        {
          "id": 600150,
          "usage": "Khi giải thích mình đã nhầm đồ đó thuộc chuyến chuyển nhà."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 600154,
          "usage": "Khi tự trấn an rằng việc sắp làm có lẽ không tệ bằng điều vừa trải qua."
        },
        {
          "id": 600156,
          "usage": "Khi tự động viên mình có thể làm được."
        },
        {
          "id": 600162,
          "usage": "Khi muốn ngăn người khác mang đi món đồ mình vẫn đang cần."
        },
        {
          "id": 600163,
          "usage": "Khi cảnh báo có người đang ở bên trong chiếc tủ."
        },
        {
          "id": 600164,
          "usage": "Khi báo rằng bên trong không còn ai nữa."
        },
        {
          "id": 600165,
          "usage": "Khi vui mừng báo mình đã làm được điều vừa thử."
        },
        {
          "id": 600166,
          "usage": "Khi gọi người khác nhìn lên và chỉ vị trí của mình."
        }
      ]
    },
    {
      "part": 5,
      "picks": [
        {
          "id": 600169,
          "usage": "Khi kể mình vừa đi thang máy lên đến tận tầng trên."
        },
        {
          "id": 600174,
          "usage": "Khi nhờ người khác mang con nhện ra xa vì mình sợ."
        },
        {
          "id": 600175,
          "usage": "Khi hỏi lại lý do người kia đã gọi mình đến."
        },
        {
          "id": 600178,
          "usage": "Khi ngạc nhiên hỏi người khác có sợ đom đóm không."
        },
        {
          "id": 600179,
          "usage": "Khi đồng ý cho ai giữ đồ với điều kiện thỉnh thoảng mang thức ăn đến."
        },
        {
          "id": 600182,
          "usage": "Khi khen mẹ của một người tốt bụng."
        },
        {
          "id": 600183,
          "usage": "Khi muốn biết người đối diện đang làm gì."
        }
      ]
    }
  ],
  "trudes_bagger": [
    {
      "part": 1,
      "picks": [
        {
          "id": 500001,
          "usage": "Khi tầm nhìn bị che và muốn báo mình không thấy gì."
        },
        {
          "id": 500003,
          "usage": "Khi nhờ người khác nâng vật đang chắn phía trước lên."
        },
        {
          "id": 500010,
          "usage": "Khi muốn kiểm tra có phải người kia đã làm việc đó."
        },
        {
          "id": 500013,
          "usage": "Khi nhận xét một vật quá lớn."
        },
        {
          "id": 500016,
          "usage": "Khi hứa sẽ đặt món đồ trở lại chỗ cũ trong đêm."
        },
        {
          "id": 500017,
          "usage": "Khi quyết định cả nhóm phải mang đồ trả lại ngay."
        },
        {
          "id": 500021,
          "usage": "Khi muốn hỏi còn cách xử lý nào khác hay không."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 500030,
          "usage": "Khi nhắc rằng không được tự ý giữ đồ của người khác."
        },
        {
          "id": 500035,
          "usage": "Khi đến trả đồ và muốn giải thích mình cũng đến để xin lỗi."
        },
        {
          "id": 500037,
          "usage": "Khi nhắc ai rằng cách họ vừa làm chưa phải lời xin lỗi phù hợp."
        },
        {
          "id": 500040,
          "usage": "Khi giải thích cách nói lời xin lỗi ở nơi mình đang sống."
        },
        {
          "id": 500045,
          "usage": "Khi nghi ngờ biểu hiện của người kia có thực sự là vui mừng."
        },
        {
          "id": 500048,
          "usage": "Khi muốn nói một lời xin lỗi ngắn gọn."
        },
        {
          "id": 500049,
          "usage": "Khi kể rằng xin lỗi đã giúp mình cảm thấy nhẹ nhõm hơn."
        }
      ]
    }
  ],
  "erdmaennchen_nudeltrick": [
    {
      "part": 1,
      "picks": [
        {
          "id": 900101,
          "usage": "Bày tỏ sự háo hức trước một buổi biểu diễn."
        },
        {
          "id": 900103,
          "usage": "Hỏi người kia thực sự biết bao nhiêu người hoặc sự vật vừa nhắc đến."
        },
        {
          "id": 900105,
          "usage": "Bảo người kia chờ xem khi họ chưa tin mình."
        },
        {
          "id": 900106,
          "usage": "Nói rằng hiện tại mình không nhìn thấy gì."
        },
        {
          "id": 900109,
          "usage": "Nhắc người kể đừng tiết lộ hết nội dung."
        },
        {
          "id": 900111,
          "usage": "Hỏi giờ lịch sự với người chưa quen."
        },
        {
          "id": 900113,
          "usage": "Hỏi xem món đồ mình tìm thấy có đúng là đồ họ đang tìm không."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 900119,
          "usage": "Dặn người khác giữ cẩn thận món đồ vừa đưa."
        },
        {
          "id": 900121,
          "usage": "Khen một buổi biểu diễn sau khi xem xong."
        },
        {
          "id": 900122,
          "usage": "Hỏi về thứ lạ vừa nhìn thấy."
        },
        {
          "id": 900124,
          "usage": "Hỏi chuyện gì đang xảy ra khi tình hình bất ngờ thay đổi."
        },
        {
          "id": 900127,
          "usage": "Phản đối khi một việc đã đi quá giới hạn."
        },
        {
          "id": 900128,
          "usage": "Báo rằng mình sẽ gọi cảnh sát khi có sự cố."
        },
        {
          "id": 900130,
          "usage": "Nói rằng mình đã đoán được người gây ra chuyện."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 900131,
          "usage": "Đề nghị người đang hoảng hốt bình tĩnh lại."
        },
        {
          "id": 900132,
          "usage": "Khẳng định mình không liên quan khi bị nghi ngờ."
        },
        {
          "id": 900136,
          "usage": "Nói một giả thuyết có vẻ khó xảy ra."
        },
        {
          "id": 900139,
          "usage": "Công nhận ý kiến của người khác có lý."
        },
        {
          "id": 900140,
          "usage": "Nhờ người quen đi cùng mình một lát."
        },
        {
          "id": 900144,
          "usage": "Hỏi người kia biết thông tin đó từ đâu."
        },
        {
          "id": 900151,
          "usage": "Báo rằng món đồ đã biến mất và nghi là bị lấy cắp."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 900154,
          "usage": "Đưa ra phỏng đoán về người gây ra sự việc."
        },
        {
          "id": 900155,
          "usage": "Hỏi ngay người kia đang nghi ai."
        },
        {
          "id": 900159,
          "usage": "Đề xuất khả năng người đó đã biết mẹo từ trước."
        },
        {
          "id": 900161,
          "usage": "Đưa ra giả thuyết rằng cuốn sách đã bị lấy trước đó."
        },
        {
          "id": 900163,
          "usage": "Nhắc đến một cửa hàng ở gần chỗ đang đứng."
        },
        {
          "id": 900164,
          "usage": "Rủ nhau đến hỏi trực tiếp để biết thêm thông tin."
        },
        {
          "id": 900165,
          "usage": "Đồng ý với một đề xuất vừa được đưa ra."
        }
      ]
    },
    {
      "part": 5,
      "picks": [
        {
          "id": 900167,
          "usage": "Rủ bạn đi nhanh qua để tránh bị nhìn thấy."
        },
        {
          "id": 900170,
          "usage": "Hỏi người khác đang mang những món đồ gì."
        },
        {
          "id": 900174,
          "usage": "Nói rằng mình đã nghĩ ra vài ý tưởng hay."
        },
        {
          "id": 900178,
          "usage": "Xin kết thúc cuộc nói chuyện vì phải đi tiếp."
        },
        {
          "id": 900180,
          "usage": "Hỏi xem bạn có nghe điều người kia vừa nói không."
        },
        {
          "id": 900182,
          "usage": "Nói rằng mình đã từng nghe chuyện này ở đâu đó."
        },
        {
          "id": 900186,
          "usage": "Đề xuất tiếp tục quan sát thay vì kết luận vội."
        }
      ]
    },
    {
      "part": 6,
      "picks": [
        {
          "id": 900189,
          "usage": "Hỏi người đứng cạnh có nhìn rõ thứ ở phía xa không."
        },
        {
          "id": 900190,
          "usage": "Hỏi điều gì sẽ xảy ra tiếp theo."
        },
        {
          "id": 900193,
          "usage": "Than nhẹ khi làm thử mà không thành công; cách nói suồng sã."
        },
        {
          "id": 900194,
          "usage": "Nói rằng mình phải đọc lại hướng dẫn."
        },
        {
          "id": 900195,
          "usage": "Kéo sự chú ý trước khi kể một điều khó tin vừa thấy."
        },
        {
          "id": 900198,
          "usage": "Bày tỏ sự ngạc nhiên khi thấy điều ngoài dự đoán."
        },
        {
          "id": 900199,
          "usage": "Nhắc rằng mình đã nói điều đó từ trước."
        }
      ]
    },
    {
      "part": 7,
      "picks": [
        {
          "id": 900202,
          "usage": "Nói rằng điều vừa phát hiện đúng với nghi ngờ ban đầu."
        },
        {
          "id": 900203,
          "usage": "Hỏi lý do người khác xuất hiện ở đây."
        },
        {
          "id": 900204,
          "usage": "Phủ nhận rằng mình hiểu lời buộc tội của người kia."
        },
        {
          "id": 900209,
          "usage": "Yêu cầu trả ngay cuốn sách; giọng ra lệnh."
        },
        {
          "id": 900214,
          "usage": "Bác bỏ điều nghe vô lý; cách nói mỉa mai."
        },
        {
          "id": 900218,
          "usage": "Xin chờ một chút vì vừa nhận ra mình làm được."
        },
        {
          "id": 900219,
          "usage": "Góp ý rằng người kia vẫn cần luyện thêm."
        }
      ]
    }
  ],
  "erdmaennchen_schmucklose": [
    {
      "part": 1,
      "picks": [
        {
          "id": 1000101,
          "usage": "Hỏi bạn có đói giống mình không."
        },
        {
          "id": 1000104,
          "usage": "Hỏi về một tiếng động lạ vừa nghe."
        },
        {
          "id": 1000107,
          "usage": "Rủ bạn đến xem chuyện gì đang xảy ra."
        },
        {
          "id": 1000109,
          "usage": "Kể rằng khi về nhà thì đồ đạc đã biến mất."
        },
        {
          "id": 1000117,
          "usage": "Báo mất toàn bộ trang sức khi trình bày vụ trộm."
        },
        {
          "id": 1000120,
          "usage": "Hỏi người kia có bằng chứng cho lời họ nói không."
        },
        {
          "id": 1000127,
          "usage": "Trấn an người đang lo lắng rằng đã có người giúp."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 1000131,
          "usage": "Hỏi ai đã biết thông tin vừa được nhắc tới."
        },
        {
          "id": 1000133,
          "usage": "Kể rằng mình về nhà sớm hơn dự kiến một ngày."
        },
        {
          "id": 1000134,
          "usage": "Hỏi xem ngoài người vừa nhắc còn ai đã đến đây."
        },
        {
          "id": 1000137,
          "usage": "Hỏi lịch sự người chứng kiến có nhận ra điều gì khác thường không."
        },
        {
          "id": 1000138,
          "usage": "Nói rằng mình không thấy bất thường và chưa tin có vụ đột nhập."
        },
        {
          "id": 1000144,
          "usage": "Chỉ nơi từng cất đồ và nói rằng giờ chúng đã biến mất."
        },
        {
          "id": 1000147,
          "usage": "Xác nhận rồi hỏi món đồ đó có phải của người kia không."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 1000158,
          "usage": "Cảm thán trước một chuyện khó tin; thành ngữ này được dùng để gây cười trong cảnh."
        },
        {
          "id": 1000160,
          "usage": "Giải thích rằng một cách nói không mang nghĩa đen."
        },
        {
          "id": 1000168,
          "usage": "Hỏi dồn xem người kia có làm rơi lạc hay không."
        },
        {
          "id": 1000169,
          "usage": "Nói rằng mình không được ăn món vừa nhắc đến."
        },
        {
          "id": 1000171,
          "usage": "Kể về việc ăn kiêng; chi tiết ăn sô cô la là câu đùa của nhân vật."
        },
        {
          "id": 1000173,
          "usage": "Giải thích rằng những món đồ đã ở đó trước khi mình tới."
        },
        {
          "id": 1000174,
          "usage": "Đưa ra phỏng đoán về người vừa có mặt trước đó."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 1000179,
          "usage": "Khen kiểu tóc của người vừa nhìn thấy."
        },
        {
          "id": 1000198,
          "usage": "Phủ nhận lấy đồ và hỏi người kia đang nói về chuyện gì."
        },
        {
          "id": 1000201,
          "usage": "Ép người khác nhận lỗi; giọng buộc tội, không phải lời đề nghị lịch sự."
        },
        {
          "id": 1000203,
          "usage": "Kể kế hoạch đi xem opera và lý do vừa đi làm tóc."
        },
        {
          "id": 1000206,
          "usage": "Đề nghị hỏi trực tiếp người có liên quan để kiểm tra sự việc."
        },
        {
          "id": 1000207,
          "usage": "Tán thành việc kiểm tra lại vì tin rằng đang có hiểu lầm."
        },
        {
          "id": 1000208,
          "usage": "Nói mình cũng định đến đó và mời mọi người đi theo."
        }
      ]
    },
    {
      "part": 5,
      "picks": [
        {
          "id": 1000216,
          "usage": "Báo rằng người kia đến vào lúc không tiện."
        },
        {
          "id": 1000217,
          "usage": "Hỏi lịch sự mối quan hệ với người vừa xuất hiện."
        },
        {
          "id": 1000220,
          "usage": "Hỏi chuyện gì đang xảy ra khi nghe ai gọi tên mình."
        },
        {
          "id": 1000222,
          "usage": "Hỏi thẳng người đối diện có lấy trộm món đồ không."
        },
        {
          "id": 1000223,
          "usage": "Phủ nhận rồi yêu cầu người quen giải thích sự việc."
        },
        {
          "id": 1000227,
          "usage": "Bày tỏ tổn thương khi bị người mình tin phản bội."
        },
        {
          "id": 1000228,
          "usage": "Đối chất khi phát hiện người kia nói sai về nhà và tài sản của họ."
        }
      ]
    },
    {
      "part": 6,
      "picks": [
        {
          "id": 1000229,
          "usage": "Thừa nhận mình đã nói dối đôi chút."
        },
        {
          "id": 1000234,
          "usage": "Hỏi lại khi phát hiện mình bị lừa suốt thời gian qua."
        },
        {
          "id": 1000236,
          "usage": "Nhắc người thân rằng không cần nói dối để làm mình vui."
        },
        {
          "id": 1000239,
          "usage": "Nhắc rằng muốn lấy đồ của người khác thì phải hỏi trước."
        },
        {
          "id": 1000241,
          "usage": "Đồng ý bỏ qua một lần, với điều kiện việc đó không tái diễn."
        },
        {
          "id": 1000243,
          "usage": "Xin lỗi vì đã vội nghi ngờ người khác."
        },
        {
          "id": 1000245,
          "usage": "Chấp nhận lời xin lỗi và cho qua chuyện cũ."
        }
      ]
    },
    {
      "part": 7,
      "picks": [
        {
          "id": 1000249,
          "usage": "Báo mình đã quay lại và sẵn sàng bắt đầu làm việc."
        },
        {
          "id": 1000250,
          "usage": "Nói rằng một việc không còn cần thiết nữa."
        },
        {
          "id": 1000251,
          "usage": "Báo rằng đã tìm ra thủ phạm."
        },
        {
          "id": 1000253,
          "usage": "Đính chính rằng người đó chỉ mượn món đồ."
        },
        {
          "id": 1000254,
          "usage": "Góp thêm một phát hiện vào cuộc nói chuyện."
        },
        {
          "id": 1000258,
          "usage": "Hỏi lại trong ngạc nhiên khi thấy chiếc khăn bị tháo len hết."
        },
        {
          "id": 1000261,
          "usage": "Trấn an rồi đề xuất tận dụng len để đan hai chiếc mũ."
        }
      ]
    }
  ],
  "erdmaennchen_spukschloss": [
    {
      "part": 1,
      "picks": [
        {
          "id": 500001,
          "usage": "Bày tỏ tò mò về lý do một người hẹn gặp mình."
        },
        {
          "id": 500005,
          "usage": "Hỏi bạn đồng hành có chắc mình đến đúng chỗ không."
        },
        {
          "id": 500013,
          "usage": "Hỏi về điều bất ngờ mà người kia đã nhắc trước đó."
        },
        {
          "id": 500016,
          "usage": "Hỏi người kia có tự mua món đồ hoặc nơi chốn vừa nhắc không."
        },
        {
          "id": 500024,
          "usage": "Khen ý tưởng vừa nghe."
        },
        {
          "id": 500025,
          "usage": "Cảm ơn rồi báo rằng vẫn còn một vấn đề."
        },
        {
          "id": 500028,
          "usage": "Hỏi rõ vấn đề cụ thể là gì."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 500042,
          "usage": "Tự tin đồng ý rằng mình làm được việc vừa được hỏi."
        },
        {
          "id": 500059,
          "usage": "Nói rằng kết quả đúng như mình đã nghĩ ngay từ đầu."
        },
        {
          "id": 500066,
          "usage": "Hỏi lịch sự xem khối công việc lớn đó có thật sự cần thiết không."
        },
        {
          "id": 500067,
          "usage": "Trấn an rằng việc đó rất dễ; cách nói thân mật."
        },
        {
          "id": 500070,
          "usage": "Nói rằng mình chưa ăn gì cả ngày khi được giao thêm việc."
        },
        {
          "id": 500072,
          "usage": "Nhận xét chiếc giường đang nằm rất thoải mái."
        },
        {
          "id": 500078,
          "usage": "Báo rằng mình vừa nghĩ ra một ý tưởng hay."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 500097,
          "usage": "Nhận ra mình đã quên mất điều người kia vừa nhắc."
        },
        {
          "id": 500102,
          "usage": "Nói rằng bây giờ mình đã hiểu thêm nhiều điều."
        },
        {
          "id": 500115,
          "usage": "Thừa nhận không muốn làm đống việc sửa sang."
        },
        {
          "id": 500117,
          "usage": "Khẳng định mình không hề muốn làm người kia sợ."
        },
        {
          "id": 500136,
          "usage": "Phản ứng khi lời giải thích hoàn toàn vô lý."
        },
        {
          "id": 500138,
          "usage": "Kể rằng mình vừa nghe một tiếng động."
        },
        {
          "id": 500145,
          "usage": "Đề xuất rằng có lẽ mọi chuyện chỉ là hiểu lầm."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 500150,
          "usage": "Giải thích rằng trời tối nên khó nhìn rõ."
        },
        {
          "id": 500153,
          "usage": "Hỏi danh tính người vừa xuất hiện; giọng thân mật."
        },
        {
          "id": 500162,
          "usage": "Xin lỗi ngắn gọn khi nhận ra mình đã gây rắc rối."
        },
        {
          "id": 500168,
          "usage": "Hỏi cả nhóm nên xử lý tình huống thế nào."
        },
        {
          "id": 500169,
          "usage": "Thừa nhận mình chưa nghĩ ra giải pháp."
        },
        {
          "id": 500180,
          "usage": "Vui vẻ nhận làm việc vừa được đề nghị."
        },
        {
          "id": 500183,
          "usage": "Bày tỏ rằng mình hoàn toàn không tán thành ý tưởng đó."
        }
      ]
    },
    {
      "part": 5,
      "picks": [
        {
          "id": 500187,
          "usage": "Hỏi khi nào có thể bắt đầu."
        },
        {
          "id": 500190,
          "usage": "Cảm ơn nhiều người đã giúp mình."
        },
        {
          "id": 500191,
          "usage": "Dự đoán sẽ thành công nếu việc kinh doanh thuận lợi như buổi khai trương."
        },
        {
          "id": 500192,
          "usage": "Nhận xét khách tham dự thật sự hào hứng."
        },
        {
          "id": 500197,
          "usage": "Báo với lễ tân rằng mình đã đặt phòng trước."
        },
        {
          "id": 500198,
          "usage": "Đáp lời khách và báo mình sẽ kiểm tra danh sách đặt phòng."
        },
        {
          "id": 500200,
          "usage": "Khen chiếc mặt nạ trong bối cảnh hóa trang."
        }
      ]
    }
  ],
  "pinguine_popcorn_panik": [
    {
      "part": 1,
      "picks": [
        {
          "id": 1300101,
          "usage": "Đáp lại thông tin mình đã biết; thường có giọng trêu hoặc mỉa mai."
        },
        {
          "id": 1300102,
          "usage": "Nhắc mọi người rằng thời gian không còn nhiều."
        },
        {
          "id": 1300103,
          "usage": "Hiểu lời cấm người không phận sự tham gia một nhiệm vụ trong phim."
        },
        {
          "id": 1300104,
          "usage": "Nhận ra khẩu lệnh yêu cầu cả đội vào vị trí."
        },
        {
          "id": 1300105,
          "usage": "Báo đã xác định được mục tiêu trong cảnh hành động."
        },
        {
          "id": 1300106,
          "usage": "Ra lệnh cho đồng đội giữ vị trí trong một nhiệm vụ."
        },
        {
          "id": 1300107,
          "usage": "Nhận ra khẩu lệnh đổi đội hình ngay lập tức."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 1300108,
          "usage": "Hỏi bỏng ngô đang ở đâu."
        },
        {
          "id": 1300109,
          "usage": "Chỉ cho người kia thấy chỗ có bỏng ngô."
        },
        {
          "id": 1300111,
          "usage": "Nêu luật ai tìm được thì được giữ món đồ."
        },
        {
          "id": 1300113,
          "usage": "Xác nhận thông tin đồng đội vừa nói là đúng."
        },
        {
          "id": 1300114,
          "usage": "Than bực khi việc không theo ý mình; cách nói suồng sã."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 1300115,
          "usage": "Phàn nàn rằng món đồ không giống hình trên bao bì."
        },
        {
          "id": 1300116,
          "usage": "Hiểu câu đùa của nhân vật về bỏng ngô chưa nổ."
        },
        {
          "id": 1300117,
          "usage": "Báo có đường ngắm không bị cản trong cảnh hành động."
        },
        {
          "id": 1300118,
          "usage": "Nhận ra lời ngăn bắn trong cảnh hành động."
        },
        {
          "id": 1300119,
          "usage": "Nói rằng người kia chỉ đang dọa hoặc giả vờ có lợi thế."
        },
        {
          "id": 1300120,
          "usage": "Nói rằng mình không biết nên gọi thứ đó là gì."
        },
        {
          "id": 1300121,
          "usage": "Hiểu lời châm chọc khi nhân vật gọi tình huống là lố bịch."
        }
      ]
    }
  ],
  "courage_diamantraub": [
    {
      "part": 1,
      "picks": [
        {
          "id": 1400101,
          "usage": "Giải thích rằng mình tin đã có sự hiểu nhầm."
        },
        {
          "id": 1400102,
          "usage": "Bác bỏ dứt khoát điều người kia vừa nói."
        },
        {
          "id": 1400104,
          "usage": "Nhận ra lời thông báo quyền im lặng trong cảnh bắt giữ."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 1400106,
          "usage": "Hiểu lời nhân vật nói về mục đích dùng số tiền trong câu chuyện."
        },
        {
          "id": 1400107,
          "usage": "Báo rằng hàng xóm đang tới gần."
        },
        {
          "id": 1400109,
          "usage": "Nhận xét một âm thanh nghe rất giống thật."
        },
        {
          "id": 1400110,
          "usage": "Hiểu nhân vật nói những kẻ kia có thể lấy ảnh cũ của mình."
        },
        {
          "id": 1400111,
          "usage": "Hiểu nhân vật kể cả giấy tờ cũng có thể đưa cho họ."
        }
      ]
    }
  ],
  "spongebob_pizza": [
    {
      "part": 1,
      "picks": [
        {
          "id": 1200101,
          "usage": "Báo mình sẽ nghe điện thoại; giọng nói vội."
        },
        {
          "id": 1200102,
          "usage": "Trả lời khách hỏi quán có pizza không."
        },
        {
          "id": 1200105,
          "usage": "Thông báo quán không có dịch vụ giao hàng."
        },
        {
          "id": 1200111,
          "usage": "Giải thích mình chưa thể lái vì vẫn đang học lái xe."
        },
        {
          "id": 1200113,
          "usage": "Bảo người kia làm giống như khi đã học."
        },
        {
          "id": 1200115,
          "usage": "Tự hỏi lại một thao tác khi không nhớ cách làm."
        },
        {
          "id": 1200118,
          "usage": "Nhắc người lái rằng họ đã chạy cạn bình xăng."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 1200122,
          "usage": "Giải thích mình không thể bỏ món hàng vì nó dành cho khách."
        },
        {
          "id": 1200126,
          "usage": "Yêu cầu buông chiếc pizza ra; giọng ra lệnh."
        },
        {
          "id": 1200128,
          "usage": "Nhắc người kia giữ chiếc pizza thật chặt."
        },
        {
          "id": 1200131,
          "usage": "Hỏi phải về nhà bằng cách nào khi bị lạc."
        },
        {
          "id": 1200133,
          "usage": "Báo rằng ở đây không có đường đi."
        },
        {
          "id": 1200137,
          "usage": "Trấn an người đi cùng rằng mình biết phải làm gì."
        },
        {
          "id": 1200138,
          "usage": "Mừng vì tưởng đã tìm ra cách thoát khỏi khó khăn."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 1200145,
          "usage": "Cảm ơn và nói mình đã rất mong chờ món hàng."
        },
        {
          "id": 1200146,
          "usage": "Hỏi phần đồ uống của mình ở đâu."
        },
        {
          "id": 1200147,
          "usage": "Hỏi lại khi chưa hiểu người kia đang nhắc tới đồ uống nào."
        },
        {
          "id": 1200149,
          "usage": "Phàn nàn vì nghi người giao hàng quên đồ uống; giọng trách móc."
        },
        {
          "id": 1200154,
          "usage": "An ủi người khác bỏ qua một chuyện không vui."
        },
        {
          "id": 1200157,
          "usage": "Thông báo quán mời món này; câu được nhân vật dùng để gây cười trong cảnh."
        },
        {
          "id": 1200161,
          "usage": "Nói rằng mình vừa kịp quay lại chỗ làm."
        }
      ]
    }
  ],
  "we_bare_bears_mall": [
    {
      "part": 1,
      "picks": [
        {
          "id": 1100102,
          "usage": "Giải thích món đồ là quà mẹ tặng nên mình rất quý."
        },
        {
          "id": 1100105,
          "usage": "Đề nghị giữ chỗ trong hàng chờ cho cả nhóm."
        },
        {
          "id": 1100108,
          "usage": "Cảm ơn người vừa giúp mình."
        },
        {
          "id": 1100109,
          "usage": "Than phiền khi chuyện không mong muốn lại lặp lại."
        },
        {
          "id": 1100110,
          "usage": "Hỏi người kia có muốn nhận làm lượt này không."
        },
        {
          "id": 1100116,
          "usage": "Kể về sự cố ngập nước xảy ra tuần trước."
        },
        {
          "id": 1100117,
          "usage": "Kể thêm về lần mất điện trước đó một tuần."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 1100127,
          "usage": "Hỏi người kia có tham gia cùng mình không."
        },
        {
          "id": 1100129,
          "usage": "Tỏ vẻ hài lòng vì nghe đúng điều mình mong đợi."
        },
        {
          "id": 1100130,
          "usage": "Giục bạn chạy ngay trong tình huống gấp."
        },
        {
          "id": 1100132,
          "usage": "Chỉ đường rẽ phải phía trước, gần thang cuốn."
        },
        {
          "id": 1100135,
          "usage": "Bảo người kia đi theo vì mình đã có kế hoạch."
        },
        {
          "id": 1100139,
          "usage": "Khen ý tưởng của người cùng nhóm."
        },
        {
          "id": 1100141,
          "usage": "Báo rằng mình đang bị đối phương bỏ xa trong cuộc đuổi bắt."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 1100151,
          "usage": "Nhận ra khẩu lệnh yêu cầu đứng yên trong cảnh truy bắt."
        },
        {
          "id": 1100153,
          "usage": "Van xin người kia đừng làm điều đang định làm."
        },
        {
          "id": 1100155,
          "usage": "Đề nghị nói chuyện để tránh làm hỏng thêm đồ đạc."
        },
        {
          "id": 1100156,
          "usage": "Khích người khác rằng họ không dám làm; lời dễ gây căng thẳng."
        },
        {
          "id": 1100157,
          "usage": "Cảnh báo người kia đừng thách thức mình; giọng căng thẳng."
        },
        {
          "id": 1100161,
          "usage": "Yêu cầu người đang giữ mình buông ra."
        },
        {
          "id": 1100165,
          "usage": "Nhắn mọi người đừng quên mình khi sắp rời đi."
        }
      ]
    }
  ],
  "frieren_s01e01": [
    {
      "part": 1,
      "picks": [
        {
          "id": 700104,
          "usage": "Khi dự đoán sẽ có một buổi ăn mừng."
        },
        {
          "id": 700105,
          "usage": "Khi nói về dự định tìm việc sau khi trở về."
        },
        {
          "id": 700106,
          "usage": "Khi ngạc nhiên vì ai đó đã nghĩ xa hơn mình."
        },
        {
          "id": 700109,
          "usage": "Khi nhắc nhau vẫn còn nhiều thời gian phía trước."
        },
        {
          "id": 700123,
          "usage": "Khi nhận xét một cử chỉ hào phóng."
        },
        {
          "id": 700126,
          "usage": "Khi rủ bạn bè ăn mừng; câu này có nhắc uống rượu."
        },
        {
          "id": 700127,
          "usage": "Khi hỏi những gì đang có đã đủ chưa."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 700139,
          "usage": "Khi hỏi thăm một người trông không khỏe."
        },
        {
          "id": 700148,
          "usage": "Khi kể rằng mình đã có khoảng thời gian vui vẻ."
        },
        {
          "id": 700149,
          "usage": "Khi cảm ơn bạn đồng hành về trải nghiệm chung."
        },
        {
          "id": 700150,
          "usage": "Khi muốn nói mình cũng cảm thấy như vậy."
        },
        {
          "id": 700156,
          "usage": "Khi nhắc ai đó vừa nói điều thiếu tế nhị."
        },
        {
          "id": 700167,
          "usage": "Khi đề xuất một chỗ có tầm nhìn đẹp hơn."
        },
        {
          "id": 700172,
          "usage": "Khi đồng ý làm theo kế hoạch vừa bàn."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 700174,
          "usage": "Khi báo với người quen rằng mình phải đi."
        },
        {
          "id": 700175,
          "usage": "Khi hỏi dự định sắp tới của người khác."
        },
        {
          "id": 700178,
          "usage": "Khi hứa thỉnh thoảng sẽ ghé thăm."
        },
        {
          "id": 700184,
          "usage": "Khi nói cửa hàng mình không có món khách tìm."
        },
        {
          "id": 700192,
          "usage": "Khi trả lời rằng mình không biết."
        },
        {
          "id": 700197,
          "usage": "Khi nhận ra có thể mình đã lạc đường."
        },
        {
          "id": 700210,
          "usage": "Khi muốn xin lỗi một cách chân thành."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 700217,
          "usage": "Khi hỏi người đi cùng đã chuẩn bị xong chưa."
        },
        {
          "id": 700220,
          "usage": "Khi nói về việc giữ vẻ ngoài gọn gàng."
        },
        {
          "id": 700224,
          "usage": "Khi gặp lại người quen và thấy họ không thay đổi."
        },
        {
          "id": 700231,
          "usage": "Khi hỏi cả nhóm có nên khởi hành ngay không."
        },
        {
          "id": 700232,
          "usage": "Khi giải thích vẫn còn sớm để xem mưa sao băng."
        },
        {
          "id": 700235,
          "usage": "Khi ngạc nhiên vì địa điểm xa hơn mình nghĩ."
        },
        {
          "id": 700238,
          "usage": "Khi một trải nghiệm khiến mình nhớ ngày xưa."
        }
      ]
    },
    {
      "part": 5,
      "picks": [
        {
          "id": 700250,
          "usage": "Khi hỏi lại người khác có thực sự nghĩ vậy không."
        },
        {
          "id": 700259,
          "usage": "Khi góp ý rằng lời nói vừa rồi không được tử tế."
        },
        {
          "id": 700268,
          "usage": "Khi thấy ai đó có vẻ không khỏe và muốn hỏi thăm."
        },
        {
          "id": 700277,
          "usage": "Khi báo mình bắt đầu lên đường."
        },
        {
          "id": 700280,
          "usage": "Khi nói đó là một trong những mục tiêu của mình."
        },
        {
          "id": 700283,
          "usage": "Khi mở lời nhờ thêm một việc."
        },
        {
          "id": 700289,
          "usage": "Khi chào tạm biệt và hẹn sớm gặp lại."
        }
      ]
    },
    {
      "part": 6,
      "picks": [
        {
          "id": 700292,
          "usage": "Khi bị lạc và muốn biết mình đang ở đâu."
        },
        {
          "id": 700293,
          "usage": "Khi lịch sự hỏi người lạ có đang tìm gì không."
        },
        {
          "id": 700294,
          "usage": "Khi lịch sự hỏi một người có bị lạc đường không."
        },
        {
          "id": 700301,
          "usage": "Khi nói mình đã ngừng uống rượu."
        },
        {
          "id": 700318,
          "usage": "Khi mở lời nhờ ai đó giúp một việc."
        },
        {
          "id": 700319,
          "usage": "Khi hỏi người có kinh nghiệm có nhận học việc không."
        },
        {
          "id": 700322,
          "usage": "Khi xin lỗi và từ chối một lời nhờ vả."
        }
      ]
    },
    {
      "part": 7,
      "picks": [
        {
          "id": 700331,
          "usage": "Khi hỏi người khác có tự tin làm được việc đó không."
        },
        {
          "id": 700338,
          "usage": "Khi bắt đầu giải thích hai lý do cho một quyết định."
        },
        {
          "id": 700351,
          "usage": "Khi đồng ý với điều kiện yêu cầu chỉ có vậy."
        },
        {
          "id": 700353,
          "usage": "Khi nói rằng tìm được người kia khá vất vả."
        },
        {
          "id": 700367,
          "usage": "Khi muốn hỏi cách để bản thân tiến bộ hơn."
        },
        {
          "id": 700370,
          "usage": "Khi cảm xúc hoặc mức độ yêu thích thay đổi tùy lúc."
        },
        {
          "id": 700372,
          "usage": "Khi hỏi hai người có hòa hợp với nhau không."
        }
      ]
    }
  ],
  "sakura_s01e01": [
    {
      "part": 1,
      "picks": [
        {
          "id": 800010,
          "usage": "Khi vừa tỉnh dậy sau một giấc mơ kỳ lạ."
        },
        {
          "id": 800040,
          "usage": "Khi giới thiệu họ tên của mình."
        },
        {
          "id": 800070,
          "usage": "Khi giới thiệu những môn học mình thích và không thích."
        },
        {
          "id": 800360,
          "usage": "Khi nói mình đang rất đói."
        },
        {
          "id": 800460,
          "usage": "Khi cảm ơn rồi báo mình phải đi."
        },
        {
          "id": 800510,
          "usage": "Khi hỏi người vừa ăn đã no chưa."
        },
        {
          "id": 800560,
          "usage": "Khi dặn người sắp đi xe hãy cẩn thận."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 800580,
          "usage": "Khi nhận ra cây anh đào đang nở hoa."
        },
        {
          "id": 800660,
          "usage": "Khi chào một người quen vào buổi sáng."
        },
        {
          "id": 800670,
          "usage": "Khi hỏi thăm và đáp lại một cách thân mật."
        },
        {
          "id": 800750,
          "usage": "Khi giới thiệu hai người học cùng lớp."
        },
        {
          "id": 800760,
          "usage": "Khi ngạc nhiên về tình bạn của hai người."
        },
        {
          "id": 800790,
          "usage": "Khi tâm sự mình có thể thích một người nào đó."
        },
        {
          "id": 800830,
          "usage": "Khi ném đồ và nhắc người kia đón lấy."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 800920,
          "usage": "Khi giới thiệu người bạn thân nhất của mình."
        },
        {
          "id": 800930,
          "usage": "Khi kể hai người đã quen nhau từ thời đi học."
        },
        {
          "id": 801030,
          "usage": "Khi cảm ơn và nói mình vẫn ổn."
        },
        {
          "id": 801110,
          "usage": "Khi đồng ý một lời rủ vì mình đang có thời gian."
        },
        {
          "id": 801260,
          "usage": "Khi khen một bức vẽ trên vở."
        },
        {
          "id": 801270,
          "usage": "Khi hỏi đó là con vật gì."
        },
        {
          "id": 801350,
          "usage": "Khi khen ai đó vừa làm rất tốt."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 801440,
          "usage": "Khi gọi người nhà và báo mình đã về."
        },
        {
          "id": 801460,
          "usage": "Khi nhắn mình tối nay sẽ về muộn."
        },
        {
          "id": 801490,
          "usage": "Khi nghe tiếng động và muốn biết có ai ở đó không."
        },
        {
          "id": 801530,
          "usage": "Khi quyết định phải đến xem có chuyện gì."
        },
        {
          "id": 801540,
          "usage": "Khi nói mình sẽ gọi cảnh sát nếu có người lạ đột nhập."
        },
        {
          "id": 801550,
          "usage": "Khi kiểm tra rồi nhận ra chẳng có ai."
        },
        {
          "id": 801600,
          "usage": "Khi nhận xét những tấm thẻ có vẻ không dùng để chơi."
        }
      ]
    },
    {
      "part": 5,
      "picks": [
        {
          "id": 801650,
          "usage": "Khi cảm ơn một hành động tử tế."
        },
        {
          "id": 801730,
          "usage": "Khi yêu cầu người khác tôn trọng mình hơn; giọng khá thẳng."
        },
        {
          "id": 801850,
          "usage": "Khi cảm ơn rồi hỏi những thứ còn lại ở đâu."
        },
        {
          "id": 801900,
          "usage": "Khi chủ động nhận dọn đồ trên bàn."
        },
        {
          "id": 801910,
          "usage": "Khi hỏi ai đó định mang đồ đi đâu."
        },
        {
          "id": 802120,
          "usage": "Khi bất ngờ vì bị giao việc và muốn hỏi tại sao lại là mình."
        },
        {
          "id": 802240,
          "usage": "Khi xin lỗi và bày tỏ mình hiểu hoàn cảnh của người kia."
        }
      ]
    },
    {
      "part": 6,
      "picks": [
        {
          "id": 802400,
          "usage": "Khi phản đối vì nghĩ mình không thể làm việc đó."
        },
        {
          "id": 802410,
          "usage": "Khi nói mình thích chiếc giường vì nó êm."
        },
        {
          "id": 802480,
          "usage": "Khi phản đối việc giao một nhiệm vụ quá nguy hiểm cho trẻ em trong phim."
        },
        {
          "id": 802540,
          "usage": "Khi ngạc nhiên vì gió bỗng mạnh lên."
        },
        {
          "id": 802580,
          "usage": "Khi thúc giục ai đó hành động ngay trong tình huống gấp."
        },
        {
          "id": 802590,
          "usage": "Khi hỏi mình có thể làm gì để xử lý tình huống."
        },
        {
          "id": 802640,
          "usage": "Khi cảm thấy mình không có cơ hội đối phó; cách nói bực bội."
        }
      ]
    },
    {
      "part": 7,
      "picks": [
        {
          "id": 802820,
          "usage": "Khi cảnh báo người khác về một cuộc tấn công trong phim."
        },
        {
          "id": 802850,
          "usage": "Khi thúc giục tìm ý tưởng trong tình huống nguy hiểm của phim."
        },
        {
          "id": 802860,
          "usage": "Khi nhân vật quyết định ngăn đối thủ lại."
        },
        {
          "id": 802870,
          "usage": "Khi nảy ra một ý tưởng và quyết định hành động."
        },
        {
          "id": 802960,
          "usage": "Khi không hiểu một việc có thể xảy ra bằng cách nào."
        },
        {
          "id": 802970,
          "usage": "Khi bất ngờ vì bản thân làm được điều từng nghĩ là không thể."
        },
        {
          "id": 803070,
          "usage": "Khi khuyến khích người khác cứ thử rồi sẽ thấy kết quả."
        }
      ]
    },
    {
      "part": 8,
      "picks": [
        {
          "id": 804002,
          "usage": "Khi chào đón mọi người đến tham dự."
        },
        {
          "id": 804006,
          "usage": "Khi giới thiệu một mẫu áo có cả tay dài và tay ngắn."
        },
        {
          "id": 804008,
          "usage": "Khi mô tả hai màu chính của trang phục."
        },
        {
          "id": 804012,
          "usage": "Khi hỏi người khác thấy bức ảnh mình chụp có đẹp không."
        },
        {
          "id": 804016,
          "usage": "Khi kết thúc nội dung của buổi hôm nay."
        },
        {
          "id": 804020,
          "usage": "Khi chào tạm biệt một cách thân mật."
        },
        {
          "id": 806004,
          "usage": "Khi rủ người nghe tưởng tượng bạn bè biết một bí mật."
        }
      ]
    }
  ],
  "spy_family_s01e01": [
    {
      "part": 1,
      "picks": [
        {
          "id": 500001,
          "usage": "Khi hỏi còn bao lâu nữa sẽ tới đại sứ quán."
        },
        {
          "id": 500013,
          "usage": "Khi giao những bức ảnh đã hứa với khách."
        },
        {
          "id": 500018,
          "usage": "Khi kết thúc trao đổi và hẹn sẽ liên lạc lại."
        },
        {
          "id": 500031,
          "usage": "Khi muốn biết người kia có đang chú ý nghe mình không."
        },
        {
          "id": 500049,
          "usage": "Khi khen ai đó lại hoàn thành công việc rất tốt."
        },
        {
          "id": 500052,
          "usage": "Khi chuyển cuộc trao đổi sang nhiệm vụ tiếp theo."
        },
        {
          "id": 500081,
          "usage": "Khi xác nhận mình đã hiểu yêu cầu."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 500085,
          "usage": "Khi nhận xét căn hộ đủ rộng cho một gia đình."
        },
        {
          "id": 500089,
          "usage": "Khi quyết định thuê hoặc mua nơi vừa được giới thiệu."
        },
        {
          "id": 500091,
          "usage": "Khi lịch sự chỉ chỗ cần ký giấy tờ."
        },
        {
          "id": 500097,
          "usage": "Khi hỏi người khác có con trai hay con gái."
        },
        {
          "id": 500121,
          "usage": "Khi lịch sự xin lỗi hoặc mở lời với người lạ."
        },
        {
          "id": 500133,
          "usage": "Khi ngạc nhiên vì mọi đáp án đều đúng."
        },
        {
          "id": 500141,
          "usage": "Khi hỏi người liên quan có đồng ý với quyết định không."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 500159,
          "usage": "Khi giới thiệu gia đình mình với hàng xóm mới."
        },
        {
          "id": 500162,
          "usage": "Khi rủ người đi cùng bước vào nhà."
        },
        {
          "id": 500163,
          "usage": "Khi hỏi đây có phải nơi mình sẽ ở không."
        },
        {
          "id": 500165,
          "usage": "Khi cho phép người khác bật thiết bị."
        },
        {
          "id": 500170,
          "usage": "Khi báo mình phải ra ngoài một lát."
        },
        {
          "id": 500185,
          "usage": "Khi hỏi người kia đang làm gì."
        },
        {
          "id": 500200,
          "usage": "Khi thấy người quen khác thường và muốn hỏi thăm."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 500206,
          "usage": "Khi nói về vai trò của sự tin tưởng trong nuôi dạy con."
        },
        {
          "id": 500207,
          "usage": "Khi đề nghị thử hiểu cảm xúc của trẻ thay vì trách mắng."
        },
        {
          "id": 500208,
          "usage": "Khi giải thích vì sao trẻ khó nói rõ cảm xúc."
        },
        {
          "id": 500213,
          "usage": "Khi trao đổi về sự tự tin và tương lai."
        },
        {
          "id": 500214,
          "usage": "Khi nói về việc giúp trẻ tự giải quyết vấn đề."
        },
        {
          "id": 500244,
          "usage": "Khi cảm ơn một người vừa giúp mình rất nhiều."
        },
        {
          "id": 500260,
          "usage": "Khi cảm ơn người đã cảnh báo mình."
        }
      ]
    },
    {
      "part": 5,
      "picks": [
        {
          "id": 500282,
          "usage": "Khi nhắc đã đến giờ học."
        },
        {
          "id": 500283,
          "usage": "Khi nghe Anya nói mình thích vẽ hơn; nhân vật tự gọi tên mình."
        },
        {
          "id": 500291,
          "usage": "Khi tự nhắc hoặc nhắc người khác bình tĩnh."
        },
        {
          "id": 500293,
          "usage": "Khi quyết định phải đến nơi an toàn."
        },
        {
          "id": 500296,
          "usage": "Khi quyết định bắt đầu lại từ đầu."
        },
        {
          "id": 500299,
          "usage": "Khi trả lời rằng cả nhóm không biết."
        },
        {
          "id": 500304,
          "usage": "Khi nói mình không biết; cách nói ngắn và thân mật."
        }
      ]
    },
    {
      "part": 6,
      "picks": [
        {
          "id": 500315,
          "usage": "Khi khen một công việc đã làm tốt."
        },
        {
          "id": 500322,
          "usage": "Khi bực hoặc ngạc nhiên vì chuyện cũ lại xảy ra."
        },
        {
          "id": 500325,
          "usage": "Khi trấn an một người đang sợ hãi."
        },
        {
          "id": 500332,
          "usage": "Khi thừa nhận mình đã nghĩ sai."
        },
        {
          "id": 500337,
          "usage": "Khi khen một người có năng khiếu."
        },
        {
          "id": 500341,
          "usage": "Khi chỉ đường đến đồn cảnh sát."
        },
        {
          "id": 500348,
          "usage": "Khi giục người kia chạy đi trong tình huống gấp."
        }
      ]
    },
    {
      "part": 7,
      "picks": [
        {
          "id": 500378,
          "usage": "Khi bất ngờ gặp ai đó và hỏi họ làm gì ở đây."
        },
        {
          "id": 500438,
          "usage": "Khi hỏi người kia vừa chơi có vui không."
        },
        {
          "id": 500388,
          "usage": "Khi muốn xác nhận người khác đã chắc chắn."
        },
        {
          "id": 500392,
          "usage": "Khi đồng ý cùng nhau về nhà."
        },
        {
          "id": 500398,
          "usage": "Khi nói đùa rằng biết đâu có lâu đài đang giảm giá."
        },
        {
          "id": 500400,
          "usage": "Khi giải thích lần này chỉ cần học thuộc đáp án trong câu chuyện."
        },
        {
          "id": 500401,
          "usage": "Khi nói một việc rất dễ làm."
        }
      ]
    },
    {
      "part": 8,
      "picks": [
        {
          "id": 500402,
          "usage": "Khi thông báo bài kiểm tra bắt đầu."
        },
        {
          "id": 500404,
          "usage": "Khi động viên người khác trước việc khó."
        },
        {
          "id": 500405,
          "usage": "Khi hỏi một từ hoặc thông tin có nghĩa gì."
        },
        {
          "id": 500406,
          "usage": "Khi thấy bài tập khó quá sức."
        },
        {
          "id": 500408,
          "usage": "Khi báo một người đã vượt qua kỳ thi."
        },
        {
          "id": 500442,
          "usage": "Khi lịch sự nhờ một đứa trẻ chuyển thư cho bố hoặc mẹ."
        },
        {
          "id": 500420,
          "usage": "Khi hỏi trong thư viết những gì."
        }
      ]
    }
  ],
  "demon_slayer_s01e01": [
    {
      "part": 1,
      "picks": [
        {
          "id": 500006,
          "usage": "Khi gọi một người quen lại gần."
        },
        {
          "id": 500008,
          "usage": "Khi nhắc ai đó không bắt buộc phải đi."
        },
        {
          "id": 500013,
          "usage": "Khi hỏi hôm nay người kia có lại vào thành phố không."
        },
        {
          "id": 500014,
          "usage": "Khi muốn xin đi cùng."
        },
        {
          "id": 500022,
          "usage": "Khi hứa sẽ giúp một người."
        },
        {
          "id": 500027,
          "usage": "Khi hứa sẽ mang quà từ thành phố về."
        },
        {
          "id": 500034,
          "usage": "Khi báo mình chuẩn bị lên đường."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 500045,
          "usage": "Khi dặn người thân nhớ sớm quay về."
        },
        {
          "id": 500046,
          "usage": "Khi dặn người thân chú ý giữ an toàn."
        },
        {
          "id": 500069,
          "usage": "Khi nhắc ai đó giữ ấm để khỏi bị cảm."
        },
        {
          "id": 500070,
          "usage": "Khi trấn an rằng chút khó khăn này không đáng ngại."
        },
        {
          "id": 500071,
          "usage": "Khi giới thiệu thứ mình mang bán và hỏi có ai cần không."
        },
        {
          "id": 500078,
          "usage": "Khi mừng vì người có thể giúp vừa xuất hiện."
        },
        {
          "id": 500080,
          "usage": "Khi muốn nhờ ai đó tìm cách giúp mình."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 500088,
          "usage": "Khi nhận ra trời đã khá muộn."
        },
        {
          "id": 500092,
          "usage": "Khi cảnh báo một việc quá nguy hiểm."
        },
        {
          "id": 500095,
          "usage": "Khi giục người quen đi tiếp và nói mình đang chờ."
        },
        {
          "id": 500099,
          "usage": "Khi cảm ơn người đã chuẩn bị bữa ăn."
        },
        {
          "id": 500111,
          "usage": "Khi nhắc người kia đã đến giờ ngủ và nên nghỉ ngơi."
        },
        {
          "id": 500114,
          "usage": "Khi nói lần tới sẽ đưa anh chị em đến cùng."
        },
        {
          "id": 500117,
          "usage": "Khi khẳng định mình không sợ."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 500120,
          "usage": "Khi chào người thân và dặn họ cẩn thận."
        },
        {
          "id": 500124,
          "usage": "Khi đến một nơi và ngạc nhiên vì chuyện đã xảy ra."
        },
        {
          "id": 500134,
          "usage": "Khi hoang mang không hiểu vì sao sự việc thành ra như vậy."
        },
        {
          "id": 500137,
          "usage": "Khi nói mình gần như không thở nổi."
        },
        {
          "id": 500139,
          "usage": "Khi động viên bản thân hoặc người khác tiếp tục chạy."
        },
        {
          "id": 500140,
          "usage": "Khi động viên ai đó đừng bỏ cuộc lúc này."
        },
        {
          "id": 500146,
          "usage": "Khi hứa sẽ tìm cách cứu một người đang gặp nạn."
        }
      ]
    },
    {
      "part": 5,
      "picks": [
        {
          "id": 500154,
          "usage": "Khi lo lắng vì người thân cư xử khác thường."
        },
        {
          "id": 500155,
          "usage": "Khi trấn an người yếu sức rằng họ không cần đi bộ."
        },
        {
          "id": 500156,
          "usage": "Khi đề nghị cõng một người đến thành phố."
        },
        {
          "id": 500157,
          "usage": "Khi hỏi người kia đã hiểu lời mình chưa."
        },
        {
          "id": 500181,
          "usage": "Khi động viên ai đó cố gắng chịu thêm."
        },
        {
          "id": 500184,
          "usage": "Khi yêu cầu người kia trấn tĩnh; giọng khá nghiêm và dễ gây áp lực."
        },
        {
          "id": 500185,
          "usage": "Khi động viên người đang rất khó khăn hãy mạnh mẽ."
        }
      ]
    },
    {
      "part": 6,
      "picks": [
        {
          "id": 500187,
          "usage": "Khi bất ngờ hoặc phản đối một hành động."
        },
        {
          "id": 500188,
          "usage": "Khi hỏi người vừa xuất hiện là ai."
        },
        {
          "id": 500210,
          "usage": "Khi mở đầu một lời giải thích đơn giản."
        },
        {
          "id": 500218,
          "usage": "Khi phản đối vì thông tin vừa nói không đúng."
        },
        {
          "id": 500225,
          "usage": "Khi tự khẳng định mình làm được."
        },
        {
          "id": 500230,
          "usage": "Khi nhận trách nhiệm xử lý một việc."
        },
        {
          "id": 500234,
          "usage": "Khi cầu xin người khác dừng lại."
        }
      ]
    },
    {
      "part": 7,
      "picks": [
        {
          "id": 500241,
          "usage": "Khi nói một tình huống có tính quyết định, được ăn cả ngã về không."
        },
        {
          "id": 500253,
          "usage": "Khi nhấn mạnh một thực tế khó chấp nhận."
        },
        {
          "id": 500261,
          "usage": "Khi khuyên người đang suy sụp đừng tuyệt vọng."
        },
        {
          "id": 500262,
          "usage": "Khi cảnh báo đó là điều lúc này không nên làm."
        },
        {
          "id": 500263,
          "usage": "Khi thể hiện mình hiểu người kia đang suy sụp."
        },
        {
          "id": 500266,
          "usage": "Khi nói về cảm giác đau đớn, cả thể chất lẫn tinh thần."
        },
        {
          "id": 500268,
          "usage": "Khi muốn nói mình hiểu cảm xúc của người khác."
        }
      ]
    },
    {
      "part": 8,
      "picks": [
        {
          "id": 500286,
          "usage": "Khi kể rằng một người biết mình không có cơ hội trước đối thủ."
        },
        {
          "id": 500300,
          "usage": "Khi báo một cô bé đang bị thương nặng."
        },
        {
          "id": 500304,
          "usage": "Khi giải thích người kia hiện rất đói."
        },
        {
          "id": 500308,
          "usage": "Khi nhận xét người khác coi mình là mối đe dọa."
        },
        {
          "id": 500310,
          "usage": "Khi nghĩ hai người có thể là trường hợp ngoại lệ."
        },
        {
          "id": 500312,
          "usage": "Khi dặn một người chăm sóc em gái của mình."
        },
        {
          "id": 500313,
          "usage": "Khi nhận ra người vừa bất tỉnh đã tỉnh dậy."
        }
      ]
    }
  ],
  "druck_s07e01": [
    {
      "part": 1,
      "picks": [
        {
          "id": 500011,
          "usage": "Khi xin lỗi vì phải dời một cuộc hẹn."
        },
        {
          "id": 500014,
          "usage": "Khi giải thích trước ngày đó đã hết chỗ."
        },
        {
          "id": 500018,
          "usage": "Khi xác nhận lại ngày gặp nhau với bạn."
        },
        {
          "id": 500020,
          "usage": "Khi giục cả nhóm đã đến lúc phải đi."
        },
        {
          "id": 500025,
          "usage": "Khi nói mình không có ý kiến, miễn là mọi người đừng cãi nhau."
        },
        {
          "id": 500037,
          "usage": "Khi đề xuất một lựa chọn cho cả nhóm."
        },
        {
          "id": 500044,
          "usage": "Khi nhờ mọi người chờ một chút vì mình vừa có ý tưởng."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 500051,
          "usage": "Khi xin chụp một tấm ảnh nhanh."
        },
        {
          "id": 500056,
          "usage": "Khi nói một trải nghiệm mới chỉ vừa bắt đầu."
        },
        {
          "id": 500057,
          "usage": "Khi bạn bè nói vui về kế hoạch tốt nghiệp rồi khám phá thế giới."
        },
        {
          "id": 500062,
          "usage": "Khi nhắc người đi cùng chú ý; cách nói thân mật."
        },
        {
          "id": 500063,
          "usage": "Khi khen màu son của một người bằng cách so sánh vui."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 500068,
          "usage": "Khi hỏi ghế hoặc chỗ ngồi có còn trống không."
        },
        {
          "id": 500070,
          "usage": "Khi hỏi một bạn học có phải người mới không."
        },
        {
          "id": 500071,
          "usage": "Khi giới thiệu tên mình với bạn mới."
        },
        {
          "id": 500087,
          "usage": "Khi bắt đầu buổi học hoặc cuộc trao đổi."
        },
        {
          "id": 500091,
          "usage": "Khi nói dự báo cuối tuần nhiệt độ xuống dưới không độ."
        },
        {
          "id": 500110,
          "usage": "Khi rủ một người lần sau cùng tham gia."
        },
        {
          "id": 500112,
          "usage": "Khi nói hóa trang và tiệc rượu không hợp sở thích của mình."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 500116,
          "usage": "Khi xin phép vào phòng của một người quen."
        },
        {
          "id": 500119,
          "usage": "Khi muốn người kia giải thích kế hoạch của họ."
        },
        {
          "id": 500122,
          "usage": "Khi đề xuất tạm chuyển đồ sang phòng khách."
        },
        {
          "id": 500133,
          "usage": "Khi yêu cầu người khác tự nghĩ cách giải quyết; giọng người lớn khá nghiêm."
        },
        {
          "id": 500134,
          "usage": "Khi yêu cầu thu dọn để tuần tới có lối đi trong phòng."
        },
        {
          "id": 500139,
          "usage": "Khi nhờ người bên cạnh cầm giúp một lát."
        },
        {
          "id": 500158,
          "usage": "Khi chào mừng một thành viên mới vào đội."
        }
      ]
    },
    {
      "part": 5,
      "picks": [
        {
          "id": 500171,
          "usage": "Khi bảo người kia cứ suy nghĩ thêm về đề nghị."
        },
        {
          "id": 500173,
          "usage": "Khi hẹn sẽ nhắn tin lại."
        },
        {
          "id": 500175,
          "usage": "Khi hỏi bạn bè đã xem bài đăng về buổi tiệc chưa."
        },
        {
          "id": 500186,
          "usage": "Khi nói mình đã vượt qua một việc không vui; giọng nhẹ nhàng."
        },
        {
          "id": 500188,
          "usage": "Khi hỏi đã đến lúc cả nhóm phải đi chưa."
        },
        {
          "id": 500190,
          "usage": "Khi gợi ý bạn mình mời thêm một người tới tiệc."
        },
        {
          "id": 500204,
          "usage": "Khi chưa quyết định và muốn suy nghĩ thêm."
        }
      ]
    },
    {
      "part": 6,
      "picks": [
        {
          "id": 500205,
          "usage": "Khi hỏi lại bạn xem người kia đã trả lời ra sao."
        },
        {
          "id": 500206,
          "usage": "Khi thuật lại rằng người kia đang suy nghĩ về lời mời."
        },
        {
          "id": 500213,
          "usage": "Khi gọi hỏi vì sao bạn bè vẫn chưa tới."
        },
        {
          "id": 500218,
          "usage": "Khi nhắc nhau đừng vui chơi quá đà."
        },
        {
          "id": 500221,
          "usage": "Khi hứa ngày mai sẽ có mặt và không quên hẹn."
        },
        {
          "id": 500234,
          "usage": "Khi nghĩ cả nhóm có thể đã đến nhầm chỗ tổ chức tiệc."
        },
        {
          "id": 500236,
          "usage": "Khi cho người đi cùng lựa chọn quay về với nhóm còn lại."
        }
      ]
    },
    {
      "part": 7,
      "picks": [
        {
          "id": 500249,
          "usage": "Khi nhận thấy thử mãi mà vẫn không có gì xảy ra."
        },
        {
          "id": 500257,
          "usage": "Khi rủ người bên cạnh cũng tham gia trò chơi."
        },
        {
          "id": 500261,
          "usage": "Khi nhắc đã đến lượt người khác; câu có xen tiếng Anh."
        },
        {
          "id": 500262,
          "usage": "Khi giục bạn nói gì đó trong trò chơi dọa ma."
        },
        {
          "id": 500267,
          "usage": "Khi nhận ra bài hát yêu thích và có người cùng sở thích."
        }
      ]
    }
  ],
  "simplicissimus_leberwurst": [
    {
      "part": 1,
      "picks": [
        {
          "id": 500005,
          "usage": "Khi mô tả một thị trường chỉ có ít doanh nghiệp rất lớn."
        },
        {
          "id": 500019,
          "usage": "Khi giải thích tính toàn cầu của thương mại."
        },
        {
          "id": 500020,
          "usage": "Khi nói về tỷ lệ sản phẩm được xuất khẩu trong nội dung phim."
        },
        {
          "id": 500041,
          "usage": "Khi giới thiệu chuyên môn và kinh nghiệm nghiên cứu của một người."
        },
        {
          "id": 500044,
          "usage": "Khi nêu yếu tố quan trọng cần chú ý trong lập luận."
        },
        {
          "id": 500053,
          "usage": "Khi so sánh mức độ liên kết của một nhóm trong nội dung phim."
        },
        {
          "id": 500078,
          "usage": "Khi nêu điều kiện khiến một việc trở nên có vấn đề."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 500080,
          "usage": "Khi hỏi cụ thể điều gì giúp tạo ra mức giá thấp."
        },
        {
          "id": 500085,
          "usage": "Khi mô tả hậu quả ruộng đồng bị bón phân quá mức."
        },
        {
          "id": 500086,
          "usage": "Khi giải thích lại bằng cách nói đơn giản hơn."
        },
        {
          "id": 500087,
          "usage": "Khi mô tả cách một chất đi vào nguồn nước ngầm."
        },
        {
          "id": 500090,
          "usage": "Khi giải thích chi phí cần để xử lý nước trước khi uống."
        },
        {
          "id": 500092,
          "usage": "Khi nhấn mạnh vấn đề này đã được biết từ lâu."
        },
        {
          "id": 500101,
          "usage": "Khi đề xuất một phương án thay thế và giải thích hệ quả."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 500143,
          "usage": "Khi thuật lại việc đã liên hệ xin phản hồi."
        },
        {
          "id": 500166,
          "usage": "Khi chỉ ra một khoản chi phí chưa nằm trong giá bán."
        },
        {
          "id": 500169,
          "usage": "Khi hỏi người xem còn nhớ một sự kiện đã nói tới không."
        },
        {
          "id": 500183,
          "usage": "Khi mô tả bên nào ký hợp đồng với người lao động."
        },
        {
          "id": 500193,
          "usage": "Khi đặt câu hỏi về nguyên nhân một sự việc xảy ra."
        },
        {
          "id": 500206,
          "usage": "Khi diễn giải cơ chế doanh nghiệp tự quản lý trong nội dung phim."
        },
        {
          "id": 500217,
          "usage": "Khi giải thích mục tiêu cải thiện điều kiện lao động của một đạo luật."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 500228,
          "usage": "Khi kể về thời điểm dự kiến thông qua một đạo luật trong quá khứ."
        },
        {
          "id": 500229,
          "usage": "Khi nói một nội dung bất ngờ bị rút khỏi chương trình nghị sự."
        },
        {
          "id": 500238,
          "usage": "Khi thuật lại rằng cuối cùng đạo luật vẫn được thông qua."
        },
        {
          "id": 500241,
          "usage": "Khi mở đầu tranh luận về giá bán và chi phí thực của sản phẩm."
        },
        {
          "id": 500244,
          "usage": "Khi đặt câu hỏi tu từ về chất lượng nước uống."
        },
        {
          "id": 500245,
          "usage": "Khi hỏi ai cuối cùng phải gánh một khoản chi phí."
        },
        {
          "id": 500258,
          "usage": "Khi mời người xem tự tìm hiểu thêm nếu có hứng thú."
        }
      ]
    }
  ],
  "k_on_s01e01": [
    {
      "part": 1,
      "picks": [
        {
          "id": 1100003,
          "usage": "Mở đầu một cột mốc mới: 'Ab heute bin ich …' = Từ hôm nay tôi là…"
        },
        {
          "id": 1100006,
          "usage": "'immer noch nicht' = vẫn chưa…; câu hỏi gián tiếp với 'in welchem'"
        },
        {
          "id": 1100008,
          "usage": "'Es wird Zeit' = đã đến lúc phải…; 'bereits vor zwei Wochen' = đã từ hai tuần trước"
        },
        {
          "id": 1100009,
          "usage": "'eine Niete sein' = dở tệ ở mảng nào đó (cách nói tự trào)"
        },
        {
          "id": 1100011,
          "usage": "Câu điều kiện với 'wenn' và chủ ngữ chung 'man'"
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 1100018,
          "usage": "'sich entscheiden' + zu-Infinitiv = quyết định làm gì"
        },
        {
          "id": 1100019,
          "usage": "'ausfüllen' = điền đơn; 'schon' = đã… rồi (Perfekt)"
        },
        {
          "id": 1100022,
          "usage": "'genauer gesagt' = nói chính xác hơn; 'kurz vor' = ngay trước/sắp"
        },
        {
          "id": 1100024,
          "usage": "Bị động 'wird aufgelöst' + hạn chót 'bis Ende des Monats'"
        },
        {
          "id": 1100030,
          "usage": "'bildschön' = đẹp tuyệt trần; câu hỏi đuôi 'findest du nicht?'"
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 1100081,
          "usage": "'scheinen … zu sein' = có vẻ như…"
        },
        {
          "id": 1100082,
          "usage": "Nhượng bộ 'zwar … aber' = tuy… nhưng"
        },
        {
          "id": 1100084,
          "usage": "Khi vui mừng nhận lời giúp đỡ: “Tuyệt quá, cảm ơn cậu!”"
        },
        {
          "id": 1100085,
          "usage": "Khi thông báo nhóm chỉ còn thiếu thêm một người nữa."
        },
        {
          "id": 1100086,
          "usage": "'als … zählen' = tính ai đó là…"
        },
        {
          "id": 1100106,
          "usage": "Công thức trang trọng 'Hiermit ist … eröffnet' = xin tuyên bố khai mạc"
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 1100114,
          "usage": "'so etwas wie' = kiểu như…"
        },
        {
          "id": 1100115,
          "usage": "'spendieren' = chiêu đãi, mời; 'bei den Hausaufgaben helfen' = giúp làm bài tập"
        },
        {
          "id": 1100135,
          "usage": "'klingen' = nghe có vẻ; 'nicht gerade' = không hẳn là…"
        },
        {
          "id": 1100144,
          "usage": "'es gibt' + Akkusativ = có thêm một…"
        },
        {
          "id": 1100154,
          "usage": "'nach etwas klingen' = nghe như là…"
        }
      ]
    },
    {
      "part": 5,
      "picks": [
        {
          "id": 1100162,
          "usage": "'kneifen' (lóng) = chuồn, né tránh"
        },
        {
          "id": 1100163,
          "usage": "'kommen und gehen, wann du willst' = đến đi tùy thích"
        },
        {
          "id": 1100184,
          "usage": "Chúc ăn ngon: 'Lass es dir gut schmecken'"
        },
        {
          "id": 1100196,
          "usage": "'Es gibt nur zwei Arten von…' = chỉ có hai loại… (câu nói đùa nổi tiếng)"
        },
        {
          "id": 1100201,
          "usage": "Konjunktiv II quá khứ: 'hätten … gefunden, wäre … aufgelöst worden' = nếu không… thì đã…"
        },
        {
          "id": 1100211,
          "usage": "Nói mình không làm được: 'Geht nicht. Ich weiß nicht, wie.'"
        }
      ]
    },
    {
      "part": 6,
      "picks": [
        {
          "id": 1100216,
          "usage": "'auf keinen Fall' = tuyệt đối không"
        },
        {
          "id": 1100218,
          "usage": "'umstimmen' = thuyết phục ai đổi ý"
        },
        {
          "id": 1100223,
          "usage": "Thành ngữ 'anbeißen' = cắn câu (nghĩa đen lẫn nghĩa bóng)"
        },
        {
          "id": 1100236,
          "usage": "'auf etwas stehen' = mê mẩn thứ gì (khẩu ngữ)"
        },
        {
          "id": 1100245,
          "usage": "'faulenzen' = lười biếng nằm dài"
        },
        {
          "id": 1100248,
          "usage": "'obwohl' = mặc dù; 'es ernst meinen' = nghiêm túc với việc gì"
        },
        {
          "id": 1100252,
          "usage": "'wenigstens' = ít nhất; 'bevor' = trước khi"
        }
      ]
    },
    {
      "part": 7,
      "picks": [
        {
          "id": 1100256,
          "usage": "'Mir fehlen die Worte' = tôi không biết nói gì nữa"
        },
        {
          "id": 1100259,
          "usage": "'Spaß an etwas haben' = thấy vui với việc gì"
        },
        {
          "id": 1100260,
          "usage": "'sich etwas überlegen' = suy nghĩ lại, đổi ý"
        },
        {
          "id": 1100273,
          "usage": "'jdm. etwas beibringen' = dạy ai điều gì; mệnh đề quan hệ với 'was'"
        },
        {
          "id": 1100274,
          "usage": "Trấn an bạn bằng một câu ngắn, tự nhiên: “Đừng lo.”"
        }
      ]
    },
    {
      "part": 8,
      "picks": [
        {
          "id": 1100278,
          "usage": "Khi bất ngờ vì bạn đã thật sự tham gia một hoạt động."
        },
        {
          "id": 1100282,
          "usage": "Khi phản ứng vì cảm thấy mình bị trêu hoặc bị xem nhẹ."
        },
        {
          "id": 1100284,
          "usage": "Kể lại lời đề nghị dạy mình một kỹ năng mới."
        },
        {
          "id": 1100285,
          "usage": "'Ist dir klar, …?' = cậu có hiểu… không?"
        },
        {
          "id": 1100286,
          "usage": "Khi nói ai đó cần tự mua một món đồ: “Du musst dir … kaufen.”"
        },
        {
          "id": 1100288,
          "usage": "Trả lời ngắn gọn tự nhiên: 'Glaube ich kaum' = tớ không tin đâu"
        },
        {
          "id": 1100289,
          "usage": "'man kriegt' = người ta mua được… (cách nói xuôi miệng)"
        }
      ]
    }
  ],
  "delicious_in_dungeon_s01e01": [
    {
      "part": 1,
      "picks": [
        {
          "id": 1200008,
          "usage": "Khi khẳng định cả nhóm đã chuẩn bị kỹ càng trước một thử thách."
        },
        {
          "id": 1200011,
          "usage": "Khi nhận xét mọi người đang di chuyển chậm chạp, nặng nề vì mệt hoặc đói."
        },
        {
          "id": 1200012,
          "usage": "Khi giải thích lý do bị trễ một ngày đường vì nhầm bản đồ."
        },
        {
          "id": 1200014,
          "usage": "Khi khuyên cả nhóm nên quay về ngay sau khi hoàn thành mục tiêu chính."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 1200051,
          "usage": "Khi hỏi ý kiến cả nhóm xem nên chọn món gì cho bữa ăn."
        },
        {
          "id": 1200054,
          "usage": "Khi nhiệt tình giới thiệu một quán ăn ngon không thể bỏ qua."
        },
        {
          "id": 1200068,
          "usage": "Khi đồng tình rằng một kế hoạch hoặc giải pháp hoàn toàn có khả năng thành công."
        },
        {
          "id": 1200073,
          "usage": "Khi nhắc bạn bè đừng coi mình là gánh nặng của cả nhóm."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 1200095,
          "usage": "Khi nhấn mạnh tình thế cấp bách và hỏi đối phương có phương án nào tốt hơn không."
        },
        {
          "id": 1200106,
          "usage": "Khi rủ đồng đội tìm một chỗ thích hợp để dừng chân và nhóm lửa."
        },
        {
          "id": 1200107,
          "usage": "Khi nhận xét rằng nếu có thêm một vài nguyên liệu nữa thì món ăn sẽ ngon hơn."
        },
        {
          "id": 1200133,
          "usage": "Khi ghi nhận rằng mình vừa rút ra được một kinh nghiệm hay kiến thức mới."
        },
        {
          "id": 1200140,
          "usage": "Khi giải thích thông tin mình đọc được trong sách và muốn tự mình kiểm chứng."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 1200145,
          "usage": "Khi chỉ ra rằng cách chế biến món ăn hiện tại hoàn toàn chưa đúng."
        },
        {
          "id": 1200160,
          "usage": "Khi nhận xét dụng cụ hiện có quá nhỏ và đề nghị đổi sang đồ dùng của mình."
        },
        {
          "id": 1200161,
          "usage": "Khi khen ngợi ai đó đã chuẩn bị đồ đạc rất chu đáo."
        },
        {
          "id": 1200178,
          "usage": "Khi đưa khăn tay cho người đối diện để lau mặt hoặc vết bẩn."
        },
        {
          "id": 1200194,
          "usage": "Khi giải thích món đồ cần thời gian chuẩn bị nhưng mình đã có sẵn một phần làm xong."
        },
        {
          "id": 1200202,
          "usage": "Khi dặn mọi người kiên nhẫn chờ thêm một chút trước khi món ăn chín."
        }
      ]
    },
    {
      "part": 5,
      "picks": [
        {
          "id": 1200206,
          "usage": "Khi nhận xét bước đầu rằng món ăn tỏa mùi rất thơm."
        },
        {
          "id": 1200212,
          "usage": "Khi tấm tắc khen ngợi một món ăn ngon vượt ngoài sức tưởng tượng."
        },
        {
          "id": 1200213,
          "usage": "Khi người nấu bày tỏ niềm vui vì món ăn hợp khẩu vị của mọi người."
        },
        {
          "id": 1200226,
          "usage": "Khi sực nhớ ra mọi người đã trò chuyện một lúc mà vẫn chưa giới thiệu tên tuổi."
        },
        {
          "id": 1200229,
          "usage": "Khi hỏi thăm xem đối phương đến một nơi nào đó vì mục đích gì."
        },
        {
          "id": 1200238,
          "usage": "Khi lịch sự xin phép được tham gia đồng hành cùng một nhóm."
        },
        {
          "id": 1200239,
          "usage": "Khi vui vẻ nhận lời và khẳng định sự góp mặt của đối phương sẽ giúp ích rất nhiều."
        }
      ]
    },
    {
      "part": 6,
      "picks": [
        {
          "id": 1200255,
          "usage": "Khi nhận xét cả nhóm đã đi đường dài và ai nấy đều thấm mệt."
        },
        {
          "id": 1200256,
          "usage": "Khi rủ mọi người tìm chỗ dừng chân qua đêm để nghỉ ngơi."
        },
        {
          "id": 1200269,
          "usage": "Khi nói rằng mình không kén chọn, miễn là món đó ăn được."
        },
        {
          "id": 1200286,
          "usage": "Khi nhận lỗi sau lúc tranh luận và thừa nhận người kia nói đúng."
        },
        {
          "id": 1200301,
          "usage": "Khi trấn an đồng đội rằng khu vực hiện tại vẫn còn an toàn."
        }
      ]
    },
    {
      "part": 7,
      "picks": [
        {
          "id": 1200314,
          "usage": "Khi giục người khác gác lại chuyện lý thuyết vì tình thế đang khẩn cấp."
        },
        {
          "id": 1200320,
          "usage": "Khi giải thích rằng đặc điểm hoặc kết quả còn tùy thuộc vào từng loại cụ thể."
        },
        {
          "id": 1200326,
          "usage": "Khi khuyên nên tập trung xử lý dứt điểm vào một chỗ thay vì dàn trải."
        },
        {
          "id": 1200330,
          "usage": "Khi bày tỏ lòng biết ơn chân thành sau khi được bạn bè giúp đỡ."
        }
      ]
    },
    {
      "part": 8,
      "picks": [
        {
          "id": 1200352,
          "usage": "Khi hoàn tất việc nấu nướng và gọi mọi người vào dùng bữa."
        },
        {
          "id": 1200355,
          "usage": "Khi nhận xét hương vị món ăn mặn mà và khác hẳn hình dung ban đầu."
        },
        {
          "id": 1200368,
          "usage": "Khi gật gù vì vừa hiểu ra quy luật hoặc cách vận hành của một sự việc."
        },
        {
          "id": 1200375,
          "usage": "Khi khuyên ngăn không nên mạo hiểm làm việc gì đó vì dễ xảy ra rủi ro."
        },
        {
          "id": 1200378,
          "usage": "Khi nhấn mạnh rằng cần đặt một vật ở vị trí thật dễ nhận thấy."
        }
      ]
    }
  ],
  "frieren_s01e02": [
    {
      "part": 1,
      "picks": [
        {
          "id": 1300011,
          "usage": "Khi trấn an người học rằng đa số mọi người đều gặp khó khăn ở bước này."
        },
        {
          "id": 1300012,
          "usage": "Khi khuyên đối phương cứ yên tâm và không cần phải lo lắng."
        },
        {
          "id": 1300013,
          "usage": "Khi khích lệ rằng với năng lực của đối phương thì việc học sẽ nhanh hơn."
        },
        {
          "id": 1300015,
          "usage": "Khi hỏi thăm tiến độ hướng dẫn hoặc đào tạo một học viên."
        },
        {
          "id": 1300016,
          "usage": "Khi khen ngợi ai đó tiến bộ vượt bậc trong thời gian ngắn."
        },
        {
          "id": 1300017,
          "usage": "Khi nhận xét một người đang quá lao tâm khổ tứ vào công việc."
        },
        {
          "id": 1300018,
          "usage": "Khi lưu ý rằng sự thái quá đôi khi lại mang đến hệ quả không tốt."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 1300026,
          "usage": "Khi nhẹ nhàng an ủi người đối diện đừng giữ vẻ mặt buồn bã."
        },
        {
          "id": 1300028,
          "usage": "Khi hứa sẽ đẩy nhanh tiến độ giải quyết một công việc quan trọng."
        },
        {
          "id": 1300029,
          "usage": "Khi nói lời cảm ơn thân mật và trìu mến với một người bạn quý."
        },
        {
          "id": 1300034,
          "usage": "Khi khẳng định chắc chắn đối phương sẽ đạt được mục tiêu vào một ngày không xa."
        },
        {
          "id": 1300054,
          "usage": "Khi bày tỏ quyết tâm sống tốt để người cưu mang mình không bao giờ phải hối tiếc."
        },
        {
          "id": 1300059,
          "usage": "Khi kiểm tra lại xem học trò còn nhớ kỹ những kiến thức đã được dạy hay không."
        },
        {
          "id": 1300061,
          "usage": "Khi trao quyền tự quyết và ủng hộ đối phương làm điều họ tin là đúng."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 1300063,
          "usage": "Khi nhận xét ai đó đã giỏi nhưng vẫn cần rèn giũa thêm đôi chút cho hoàn thiện."
        },
        {
          "id": 1300068,
          "usage": "Khi lịch sự nhờ một người đáng tin cậy đưa ai đó đồng hành cùng."
        },
        {
          "id": 1300071,
          "usage": "Khi nhận ra mình vừa bị bạn bè dùng mẹo gài vào thế đã rồi."
        },
        {
          "id": 1300074,
          "usage": "Khi hỏi thẳng đối phương đang có ý định hay kế hoạch gì."
        },
        {
          "id": 1300080,
          "usage": "Khi khuyên ai đó hãy nói lời chia tay đàng hoàng và trọn vẹn với người thân."
        },
        {
          "id": 1300082,
          "usage": "Khi chân thành khen ngợi sự tử tế và tấm lòng nhân hậu của một người bạn."
        },
        {
          "id": 1300087,
          "usage": "Khi mở lời bày tỏ sự biết ơn sâu sắc đối với người đã giúp đỡ mình."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 1300092,
          "usage": "Khi báo hiệu công việc đã hoàn tất và mọi người có thể dừng tay."
        },
        {
          "id": 1300093,
          "usage": "Khi cảm ơn người đã giúp đỡ mình và trao phần thưởng như đã hẹn."
        },
        {
          "id": 1300096,
          "usage": "Khi hỏi đồng đội xem thù lao nhận được sau chuyến công việc lần này là gì."
        },
        {
          "id": 1300098,
          "usage": "Khi rủ bạn bè để lát nữa hãy đem một món đồ hay kỹ năng mới ra thử nghiệm."
        },
        {
          "id": 1300102,
          "usage": "Khi giải thích nhẹ nhàng rằng việc sưu tầm một thứ gì đó đơn giản là thú vui cá nhân."
        },
        {
          "id": 1300105,
          "usage": "Khi trả lời vừa phải, linh hoạt về mức độ yêu thích hoặc cảm xúc của mình."
        },
        {
          "id": 1300110,
          "usage": "Khi trang trọng mở lời nhờ người khác giúp mình một công việc."
        }
      ]
    },
    {
      "part": 5,
      "picks": [
        {
          "id": 1300117,
          "usage": "Khi nhận xét một công trình hay đồ vật đã bị hư hại, xuống cấp nặng nề."
        },
        {
          "id": 1300127,
          "usage": "Khi nói thẳng rằng kết quả hiện tại là do chính người đó tự chuốc lấy."
        },
        {
          "id": 1300128,
          "usage": "Khi nhắc lại tính cách thích làm tâm điểm chú ý của một người bạn."
        },
        {
          "id": 1300130,
          "usage": "Khi hào hứng hỏi bạn bè xem tư thế tạo dáng của mình trông đã đẹp chưa."
        },
        {
          "id": 1300135,
          "usage": "Khi xắn tay áo rủ mọi người cùng bắt đầu dọn dẹp sạch sẽ một khu vực."
        },
        {
          "id": 1300136,
          "usage": "Khi bày tỏ sự cảm kích vì đối phương đã giúp đỡ mình vô cùng đắc lực."
        },
        {
          "id": 1300146,
          "usage": "Khi thừa nhận mình không biết vì chưa từng tận mắt nhìn thấy thứ đó bao giờ."
        }
      ]
    },
    {
      "part": 6,
      "picks": [
        {
          "id": 1300158,
          "usage": "Khi tinh ý nhận ra người đối diện đang lén giấu mình một chuyện gì đó."
        },
        {
          "id": 1300159,
          "usage": "Khi trấn an đối phương cứ đưa ra cho mình xem vì mình sẽ không giận đâu."
        },
        {
          "id": 1300164,
          "usage": "Khi hỏi lại để xác nhận xem đề xuất táo bạo của đối phương có phải là thật không."
        },
        {
          "id": 1300168,
          "usage": "Khi khẳng định một mục tiêu rất xứng đáng để bỏ công sức tìm kiếm."
        },
        {
          "id": 1300172,
          "usage": "Khi thành thật chia sẻ rằng mình làm việc này vì tâm nguyện của chính bản thân."
        },
        {
          "id": 1300176,
          "usage": "Khi đề xuất mở rộng phạm vi tìm kiếm sau một thời gian chưa có kết quả."
        },
        {
          "id": 1300189,
          "usage": "Khi nhắc người nghe nhìn nhận sự việc từ góc độ và trải nghiệm của người khác."
        }
      ]
    },
    {
      "part": 7,
      "picks": [
        {
          "id": 1300194,
          "usage": "Khi nhận xét người đồng hành đang suy nghĩ và lo lắng rất chu toàn."
        },
        {
          "id": 1300195,
          "usage": "Khi bày tỏ sự đồng cảm rằng mình hiểu rõ điều đối phương đang bận tâm."
        },
        {
          "id": 1300198,
          "usage": "Khi xin phép được kiên trì nán lại tìm kiếm thêm một chút thời gian nữa."
        },
        {
          "id": 1300201,
          "usage": "Khi hỏi thẳng xem đối phương có thực sự định dừng cuộc tìm kiếm hay không."
        },
        {
          "id": 1300203,
          "usage": "Khi ra hiệu cho đồng đội lập tức bám theo dấu vết vừa phát hiện."
        },
        {
          "id": 1300204,
          "usage": "Khi nói khiêm tốn rằng công việc mình đang làm chỉ là thú vui giết thời gian."
        },
        {
          "id": 1300205,
          "usage": "Khi phản biện rằng hành động thực tế của đối phương nghiêm túc hơn lời họ nói nhiều."
        }
      ]
    },
    {
      "part": 8,
      "picks": [
        {
          "id": 1300222,
          "usage": "Khi hứa hẹn một ngày nào đó sẽ đưa người bạn đồng hành đến ngắm một cảnh đẹp."
        },
        {
          "id": 1300223,
          "usage": "Khi nhẹ nhàng nhận lời hẹn ước với thái độ tùy duyên nếu có cơ hội."
        },
        {
          "id": 1300226,
          "usage": "Khi vỡ òa thông báo rằng cả nhóm đã thực sự tìm thấy thứ mình hằng kiếm tìm."
        },
        {
          "id": 1300233,
          "usage": "Khi bộc bạch rằng phương tiện ban đầu không quan trọng bằng mục đích tự lập."
        },
        {
          "id": 1300234,
          "usage": "Khi nhắc nhở ai đó trân trọng con đường mà chính họ đã gắn bó và lựa chọn."
        },
        {
          "id": 1300237,
          "usage": "Khi trầm trồ khen ngợi một khung cảnh thiên nhiên đẹp rực rỡ trước mắt."
        },
        {
          "id": 1300243,
          "usage": "Khi rủ người đồng hành tiếp tục lên đường sau khi đã hoàn thành tâm nguyện."
        }
      ]
    }
  ],
  "sakura_s01e02": [
    {
      "part": 1,
      "picks": [
        {
          "id": 1400004,
          "usage": "Khi hỏi lý do vì sao người kia lại hẹn đồng hồ báo thức vào một giờ cụ thể."
        },
        {
          "id": 1400005,
          "usage": "Khi nhắc ai đó rằng theo dự định ban đầu thì họ muốn thức dậy sớm hơn."
        },
        {
          "id": 1400006,
          "usage": "Khi thắc mắc lúc bất ngờ nghe thấy một giọng nói lạ xung quanh mình."
        },
        {
          "id": 1400011,
          "usage": "Khi hỏi thăm trực tiếp xem đối phương đang gặp chuyện gì bất thường."
        },
        {
          "id": 1400016,
          "usage": "Khi nói với người vừa mới tỉnh táo lại sau cơn ngái ngủ."
        },
        {
          "id": 1400026,
          "usage": "Khi đưa ra bằng chứng cụ thể để khích lệ ai đó tin vào năng lực của bản thân."
        },
        {
          "id": 1400029,
          "usage": "Khi thừa nhận mình đã làm xong việc nhưng quá trình thực hiện không hề dễ dàng."
        }
      ]
    },
    {
      "part": 2,
      "picks": [
        {
          "id": 1400041,
          "usage": "Khi khen ngợi bữa ăn sáng hôm nay được chuẩn bị trông rất ngon mắt."
        },
        {
          "id": 1400048,
          "usage": "Khi giải thích lý do phải đi sớm vì hôm nay đến phiên mình trực nhật dọn vệ sinh."
        },
        {
          "id": 1400052,
          "usage": "Khi vui vẻ đưa cho bạn bè một món đồ ăn hoặc quà nhỏ mình mang về."
        },
        {
          "id": 1400054,
          "usage": "Khi tự nhắc bản thân hoặc báo với người khác rằng mình phải khẩn trương lên cho kịp giờ."
        },
        {
          "id": 1400058,
          "usage": "Khi dặn ai đó đợi mọi người ra khỏi nhà rồi mới được bật tivi xem."
        },
        {
          "id": 1400072,
          "usage": "Khi reo lên vui mừng vì thấy người mình tìm vẫn còn ở nhà chứ chưa đi."
        },
        {
          "id": 1400083,
          "usage": "Khi tạm biệt và dặn dò người đi xe hoặc trượt patin chú ý an toàn trên đường."
        }
      ]
    },
    {
      "part": 3,
      "picks": [
        {
          "id": 1400091,
          "usage": "Khi chào buổi sáng và nhận xét cả hai đều đến nơi sớm hơn thường lệ."
        },
        {
          "id": 1400097,
          "usage": "Khi kể lại cảm giác sững sờ như không tin vào mắt mình trước một cảnh tượng lạ."
        },
        {
          "id": 1400110,
          "usage": "Khi lịch sự ngỏ ý muốn được giới thiệu làm quen với người bạn mới của đối phương."
        },
        {
          "id": 1400115,
          "usage": "Khi nhắc nhở bạn bè đừng đặt những biệt danh ngớ ngẩn hay trêu chọc mình."
        },
        {
          "id": 1400127,
          "usage": "Khi thở phào nhẹ nhõm sau khi vừa thoát khỏi một tình huống suýt gặp rắc rối."
        },
        {
          "id": 1400140,
          "usage": "Khi trấn an bạn mình cứ yên tâm làm việc vì mình sẽ đứng canh chừng giúp."
        },
        {
          "id": 1400159,
          "usage": "Khi từ chối lời rủ đi chơi ngay sau giờ học vì phải về nhà trước."
        }
      ]
    },
    {
      "part": 4,
      "picks": [
        {
          "id": 1400166,
          "usage": "Khi chỉ cho người bên cạnh xem một cảnh tượng bừa bộn hoặc tồi tệ trước mắt."
        },
        {
          "id": 1400184,
          "usage": "Khi kể lại sự vất vả sau khi phải thu dọn một đống hỗn độn."
        },
        {
          "id": 1400185,
          "usage": "Khi tìm thấy mặt tích cực của sự cố là được nghỉ hai tiết học."
        },
        {
          "id": 1400187,
          "usage": "Khi thừa nhận hiện tại chưa rõ nguyên nhân nhưng khẳng định cả nhóm sẽ sớm điều tra ra."
        },
        {
          "id": 1400194,
          "usage": "Khi phản đối dứt khoát một kế hoạch mạo hiểm diễn ra ngay trong đêm."
        },
        {
          "id": 1400195,
          "usage": "Khi khẳng định chắc nịch rằng mình sẽ không bước chân vào một nơi vắng vẻ lúc ban đêm."
        },
        {
          "id": 1400208,
          "usage": "Khi giải thích đơn giản rằng mình thích làm một việc vì đó là sở thích cá nhân."
        }
      ]
    },
    {
      "part": 5,
      "picks": [
        {
          "id": 1400217,
          "usage": "Khi trấn an người vừa tới điểm hẹn rằng mình cũng mới đến chứ chưa phải đợi lâu."
        },
        {
          "id": 1400219,
          "usage": "Khi dặn người thân hoặc bạn bè cứ gọi ngay cho mình bất cứ lúc nào cần hỗ trợ."
        },
        {
          "id": 1400220,
          "usage": "Khi giải thích rằng chỉ cần mình gọi điện là người nhà hoặc xe sẽ đến đón."
        },
        {
          "id": 1400226,
          "usage": "Khi giục ai đó nhanh chóng đi thay bộ quần áo khác cho kịp việc."
        },
        {
          "id": 1400229,
          "usage": "Khi hỏi ý kiến xem đối phương có muốn tự tay chọn một món đồ ưng ý không."
        },
        {
          "id": 1400245,
          "usage": "Khi động viên một người đang ngại ngùng rằng họ trông rất tuyệt và không có gì phải xấu hổ."
        },
        {
          "id": 1400246,
          "usage": "Khi trao thêm một món quà hay phụ kiện phù hợp mà mình đã chuẩn bị riêng cho người kia."
        }
      ]
    },
    {
      "part": 6,
      "picks": [
        {
          "id": 1400251,
          "usage": "Khi giật mình hỏi người đi cùng xem họ có nghe thấy tiếng động lạ vừa phát ra không."
        },
        {
          "id": 1400252,
          "usage": "Khi trả lời rằng bản thân mình hoàn toàn không nghe thấy âm thanh gì bất thường."
        },
        {
          "id": 1400254,
          "usage": "Khi nhắc nhở bạn mình giữ bình tĩnh và đừng hoảng loạn trước tình huống bất ngờ."
        },
        {
          "id": 1400256,
          "usage": "Khi cảnh báo đồng đội về một hiện tượng kỳ lạ báo hiệu nguy hiểm sắp tới."
        },
        {
          "id": 1400267,
          "usage": "Khi phân công người đồng hành ở lại trông chừng và bảo vệ bạn mình."
        },
        {
          "id": 1400268,
          "usage": "Khi cổ vũ và bày tỏ sự tin tưởng tuyệt đối rằng bạn mình sẽ giải quyết tốt công việc."
        },
        {
          "id": 1400283,
          "usage": "Khi tán thành nhận định của bạn và nảy ra sáng kiến giải quyết ngay không cần chờ đến sáng."
        }
      ]
    },
    {
      "part": 7,
      "picks": [
        {
          "id": 1400284,
          "usage": "Khi than thở rằng thử thách trước mắt vượt quá khả năng chịu đựng của bản thân."
        },
        {
          "id": 1400285,
          "usage": "Khi tự hỏi trong lúc bế tắc xem mình có thể làm cách nào để xoay chuyển tình thế."
        },
        {
          "id": 1400286,
          "usage": "Khi hét lên yêu cầu đối phương buông tay hoặc thả mình ra ngay lập tức."
        },
        {
          "id": 1400294,
          "usage": "Khi hào hứng khen ngợi sáng kiến thông minh và kịp thời của người bạn đồng hành."
        },
        {
          "id": 1400297,
          "usage": "Khi tiếp thêm sự tự tin cho bạn bè ngay trước thời khắc quyết định."
        },
        {
          "id": 1400303,
          "usage": "Khi vui mừng thông báo rằng mình đã quay phim hoặc ghi lại được toàn bộ sự việc."
        }
      ]
    },
    {
      "part": 8,
      "picks": [
        {
          "id": 1400304,
          "usage": "Khi hỏi thăm bạn cùng lớp xem họ có nhìn thấy người mình đang tìm ở đâu không."
        },
        {
          "id": 1400308,
          "usage": "Khi chân thành cảm ơn người bạn đã thức khuya vất vả giúp đỡ mình đêm qua."
        },
        {
          "id": 1400309,
          "usage": "Khi trao một món quà nhỏ mình mang theo để bày tỏ lòng biết ơn."
        },
        {
          "id": 1400311,
          "usage": "Khi tấm tắc khen chất lượng những bức ảnh hoặc thước phim vừa quay được."
        },
        {
          "id": 1400319,
          "usage": "Khi lịch sự từ chối vì ngại làm phiền người khác quá nhiều."
        },
        {
          "id": 1400321,
          "usage": "Khi nói đùa rằng mình phải đi theo để làm quân sư trang phục cho bạn."
        },
        {
          "id": 1400328,
          "usage": "Khi mở đầu buổi trò chuyện bằng lời rủ mọi người cùng xem qua vài hình ảnh thú vị."
        }
      ]
    }
  ]
};

for (const [key, parts] of Object.entries(KINO_PRACTICE_DATA)) {
  for (const part of parts) {
    const chapter = KINO_CHAPTER_DATA[key].chapters[part.part - 1];
    chapter.picks = part.picks.map(pick => pick.id);
    chapter.practiceUsage = Object.fromEntries(part.picks.map(pick => [pick.id, pick.usage]));
  }
}
