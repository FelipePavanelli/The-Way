@include('chat.components.head')

<body>
    <div class="app-container">
        @include('chat.components.header')
        @include('chat.components.chat-list')
        @include('chat.components.chat-messages')
        @include('chat.components.footer')
    </div>
    @include('chat.components.delete-modal')
</body>

</html>
