# mail2ghost2mail

Interfacing Ghost with Emails: Sending out emails when new posts are published and creating new posts by sending emails.

**Note** Currently only one direction is implemented: By sending emails you can create blog posts.

## How to run it

Prerequisites:

* Node js installed

Get the code, install the dependencies and start it:

```shell
git clone https://github.com/tillg/mail2ghost2mail.git
cd mail2ghost2mail
npm i
npm start
```

Of course it will need some configuration 😀 ...see below...

## Configuring

`mail2ghost2mail` has a couple of confguration areas and options:

### Secrets

In order to read/write emails and ghost posts it needs access to those 2 systems. This information is held in the `.env` file. You can create and edit it like so:

```shell
cd src
cp sample.env .env
```

Then edit the file `.env` and enter your configuration for accessing the email account as well as the Ghost API.

### Email addresses <==> ghost author

When creating a new blog post based on an incoming email we need to set the author. This is based on a mapping between email senders and ghost authors. This way a blog author can send from multiple email addresses (i.e. his office and private email account).

This mapping is described in the `config/default.json` file. The file structure is like so:

```json
{
	"postAuthors": {
		"adam@something.com": {
			"emailAddresses": ["adam@gmail.com", "adam@something.com", "adam@work-domain.com"]
		},
		"joe@gmail.com": {
			"emailAddresses": ["joe@gmail.com"]
		}
	}
}
```

## To do

Things that need to be done:

* Test the blog creation by email with more diverse content. I.e. sending an email with inline pics, youtube links etc.
* Have more tests...
* Sending out emails when new blog posts are created